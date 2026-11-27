'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  AISettings,
  ChatMessageItem,
  loadAISettings,
  saveAISettings,
} from '@/lib/ai-settings';
import {
  appendMessage,
  createSession,
  DEFAULT_SESSION_TITLE,
  deleteMessageFromSession,
  editUserMessageInSession,
  getSessionsSnapshot,
  getServerSessionsSnapshot,
  messageTimeLabel,
  saveSessions,
  sanitizeSessionTitle,
  sessionTitleFromText,
  subscribeToSessions,
  truncateAfterMessage,
  truncateBeforeMessage,
  uniqueSessionTitle,
} from '@/lib/ai-sessions';
import type {
  ChatSession,
  SessionModuleContext,
} from '@/lib/ai-sessions';
import { streamAssistantReply } from '@/lib/ai-chat-client';
import { useAiServerStatus } from '@/hooks/use-ai-server-status';
import type { AiServerStatus } from '@/lib/ai-chat-client';

/**
 * The shared assistant chat engine behind both surfaces (drawer and
 * /assistant page): persisted multi-session state, streaming with abort,
 * per-session subject binding. Sessions live in localStorage through a
 * useSyncExternalStore (the app's house storage pattern), so server render
 * and hydration agree, and writes from either surface or another tab sync.
 * Shells own only their layout.
 */

interface UseAssistantChatOptions {
  /** Context bound to a session created fresh (no send history yet) */
  getNewSessionContext?: () => SessionModuleContext | null;
  /** Health-check the API route only when true (drawer passes isOpen) */
  statusEnabled?: boolean;
}

const randomSuffix = () => Math.random().toString(36).slice(2, 8);

const noopSubscribe = () => () => {};

export function useAssistantChat(
  options: UseAssistantChatOptions = {}
) {
  const { getNewSessionContext, statusEnabled = true } = options;

  const [settings, setSettings] = useState<AISettings>(loadAISettings);

  // Persisted sessions: storage-driven snapshot (empty on the server, so
  // hydration is safe; subscribers re-render on every committed write)
  const { sessions, activeId } = useSyncExternalStore(
    subscribeToSessions,
    getSessionsSnapshot,
    getServerSessionsSnapshot
  );
  const isHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [streamingModel, setStreamingModel] = useState<string | null>(null);
  const [streamingSessionId, setStreamingSessionId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  const activeSession: ChatSession | null =
    sessions.find((s) => s.id === activeId) ?? null;
  const messages: ChatMessageItem[] = activeSession?.messages ?? [];

  const serverStatus: AiServerStatus = useAiServerStatus(statusEnabled);

  // Abort an in-flight stream when the surface unmounts (route change):
  // the partial reply is kept with the stopped flag and persisted
  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );

  // Page-first binding: the moment a surface opens, the active session
  // adopts the page's subject, so the context strip always shows what the
  // next send will be grounded in («مبحث فعال» = همین صفحه). Sessions with
  // no page context (home/exams) keep their existing binding.
  const openBindKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (!statusEnabled) return;
    const ctx = getNewSessionContext?.() ?? null;
    if (!ctx) return;
    const snapshot = getSessionsSnapshot();
    const current = snapshot.sessions.find((s) => s.id === snapshot.activeId);
    const ctxKey = `${ctx.moduleId}|${ctx.subtopicId || ''}`;
    const bindKey = `${snapshot.activeId || 'none'}>${ctxKey}`;
    if (openBindKeyRef.current === bindKey) return;
    openBindKeyRef.current = bindKey;
    const currentKey = current?.moduleContext
      ? `${current.moduleContext.moduleId}|${current.moduleContext.subtopicId || ''}`
      : null;
    if (current && currentKey === ctxKey) return;
    if (!current) {
      const fresh = createSession(ctx);
      fresh.title = uniqueSessionTitle(
        snapshot.sessions,
        DEFAULT_SESSION_TITLE,
        fresh.id
      );
      saveSessions([fresh, ...snapshot.sessions], fresh.id);
    } else {
      saveSessions(
        snapshot.sessions.map((s) =>
          s.id === current.id ? { ...s, moduleContext: ctx } : s
        ),
        snapshot.activeId
      );
    }
  }, [statusEnabled, getNewSessionContext]);

  // Persist settings on every change
  const updateSettings = useCallback(
    (updater: (prev: AISettings) => AISettings) => {
      setSettings((prev) => {
        const next = updater(prev);
        saveAISettings(next);
        return next;
      });
    },
    []
  );

  const updateSession = useCallback(
    (sessionId: string, updater: (s: ChatSession) => ChatSession) => {
      const next = getSessionsSnapshot().sessions.map((s) =>
        s.id === sessionId ? updater(s) : s
      );
      saveSessions(next, getSessionsSnapshot().activeId);
    },
    []
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  /**
   * Streams the reply for `history` into `sessionId` and persists it.
   * Callers must have already committed the history (new user message,
   * edited fork, or truncated regenerate) and guarded against a busy stream.
   */
  const runStream = useCallback(
    async (
      sessionId: string,
      sessionContext: SessionModuleContext | null,
      history: ChatMessageItem[]
    ) => {
      setErrorBanner(null);
      setIsLoading(true);
      setStreamingText('');
      setStreamingModel(null);
      setStreamingSessionId(sessionId);
      streamingIdRef.current = sessionId;

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await streamAssistantReply({
          settings,
          moduleContext: sessionContext,
          history,
          signal: controller.signal,
          onMeta: (modelUsed) => setStreamingModel(modelUsed),
          onDelta: (text) => setStreamingText(text),
        });

        if (result.text) {
          updateSession(sessionId, (s) =>
            appendMessage(s, {
              id: `assistant-${Date.now()}-${randomSuffix()}`,
              role: 'assistant',
              content: result.text,
              timestamp: messageTimeLabel(),
              providerUsed: settings.provider,
              modelUsed: result.modelUsed || settings.model,
              stopped: result.stopped || undefined,
            })
          );
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'خطای شبکه در ارتباط با سرور';
        setErrorBanner(msg);
      } finally {
        setIsLoading(false);
        setStreamingText(null);
        setStreamingModel(null);
        setStreamingSessionId(null);
        streamingIdRef.current = null;
        abortControllerRef.current = null;
      }
    },
    [settings, updateSession]
  );

  const sendMessage = useCallback(
    async (promptText?: string, historyOverride?: ChatMessageItem[]) => {
      const textToSend = (promptText ?? '').trim();
      if (!textToSend || abortControllerRef.current) return;

      // Resolve (or create) the target session so grounding binds at send time
      const snapshot = getSessionsSnapshot();
      let target = snapshot.sessions.find((s) => s.id === snapshot.activeId);
      if (!target) {
        target = createSession(getNewSessionContext?.() ?? null);
        saveSessions([target, ...snapshot.sessions], target.id);
      } else {
        // Page-first grounding: a send made from a lesson/examples/exam
        // surface is always grounded in that page's subject, even if the
        // open-time bind has not run yet
        const liveCtx = getNewSessionContext?.() ?? null;
        if (liveCtx) {
          const bound = { ...target, moduleContext: liveCtx };
          saveSessions(
            snapshot.sessions.map((s) => (s.id === bound.id ? bound : s)),
            snapshot.activeId
          );
          target = bound;
        }
      }
      const sessionId = target.id;

      const baseHistory = historyOverride ?? target.messages;
      const userMsg: ChatMessageItem = {
        id: `user-${Date.now()}-${randomSuffix()}`,
        role: 'user',
        content: textToSend,
        timestamp: messageTimeLabel(),
      };
      const updatedHistory = [...baseHistory, userMsg];
      updateSession(sessionId, (s) => {
        const next = appendMessage(s, userMsg);
        if (next.title !== s.title) {
          // appendMessage auto-titled from the first prompt: keep it unique
          next.title = uniqueSessionTitle(
            getSessionsSnapshot().sessions,
            next.title,
            sessionId
          );
        }
        return next;
      });

      await runStream(sessionId, target.moduleContext, updatedHistory);
    },
    [getNewSessionContext, runStream, updateSession]
  );

  /**
   * Saves an edited user message and regenerates from it (ChatGPT fork
   * semantics): everything after the message belonged to the old branch
   * and is dropped. The title stays as-is.
   */
  const editUserMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const text = (newContent ?? '').trim();
      if (!text || abortControllerRef.current) return;

      const snapshot = getSessionsSnapshot();
      const target = snapshot.sessions.find((s) => s.id === snapshot.activeId);
      if (!target) return;

      // Page-first grounding applies at edit time too: the regenerated
      // branch must be grounded in the page the user is on right now
      const liveCtx = getNewSessionContext?.() ?? null;
      const bound = liveCtx ? { ...target, moduleContext: liveCtx } : target;
      const edited = editUserMessageInSession(bound, messageId, text);
      if (!edited) return;

      updateSession(edited.id, () => edited);
      await runStream(edited.id, edited.moduleContext, edited.messages);
    },
    [getNewSessionContext, runStream, updateSession]
  );

  /** Remove one message from the active session (safe during a stream) */
  const deleteMessage = useCallback(
    (messageId: string) => {
      const snapshot = getSessionsSnapshot();
      const target = snapshot.sessions.find((s) => s.id === snapshot.activeId);
      if (!target) return;
      const next = deleteMessageFromSession(target, messageId);
      if (next) updateSession(target.id, () => next);
    },
    [updateSession]
  );

  /**
   * Regenerates the reply for `assistantMessageId` (ChatGPT fork semantics):
   * everything after that reply belonged to the old branch and is dropped,
   * then the preceding user message is re-sent.
   */
  const regenerateMessage = useCallback(
    async (assistantMessageId: string) => {
      if (abortControllerRef.current) return;
      const snapshot = getSessionsSnapshot();
      const target = snapshot.sessions.find((s) => s.id === snapshot.activeId);
      if (!target) return;
      const index = target.messages.findIndex(
        (m) => m.id === assistantMessageId && m.role === 'assistant'
      );
      if (index < 1 || target.messages[index - 1].role !== 'user') return;
      const history = target.messages.slice(0, index);
      const truncated = truncateBeforeMessage(target, assistantMessageId);
      if (!truncated) return;
      updateSession(target.id, () => truncated);
      await runStream(target.id, target.moduleContext, history);
    },
    [runStream, updateSession]
  );

  /** Resend the last user prompt of the active session (error retry) */
  const regenerate = useCallback(() => {
    if (abortControllerRef.current) return;
    const snapshot = getSessionsSnapshot();
    const current = snapshot.sessions.find((s) => s.id === snapshot.activeId);
    if (!current) return;
    const lastUser = [...current.messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (!lastUser) return;
    // Keep the user message itself; only the broken branch after it is dropped
    const truncated = truncateAfterMessage(current, lastUser.id);
    if (!truncated) return;
    updateSession(current.id, () => truncated);
    void runStream(current.id, current.moduleContext, truncated.messages);
  }, [runStream, updateSession]);

  /** Start a real new session instead of wiping the old conversation */
  const newChat = useCallback(() => {
    if (abortControllerRef.current) stop();
    const fresh = createSession(getNewSessionContext?.() ?? null);
    fresh.title = uniqueSessionTitle(
      getSessionsSnapshot().sessions,
      DEFAULT_SESSION_TITLE,
      fresh.id
    );
    setErrorBanner(null);
    saveSessions([fresh, ...getSessionsSnapshot().sessions], fresh.id);
    return fresh;
  }, [getNewSessionContext, stop]);

  /** Rename a session; the new name must stay unique across sessions */
  const renameSession = useCallback(
    (id: string, candidate: string) => {
      const clean = sanitizeSessionTitle(candidate);
      if (!clean) return;
      updateSession(id, (s) => ({
        ...s,
        title: uniqueSessionTitle(
          getSessionsSnapshot().sessions,
          clean,
          id
        ),
      }));
    },
    [updateSession]
  );

  const selectSession = useCallback(
    (id: string) => {
      if (!getSessionsSnapshot().sessions.some((s) => s.id === id)) return;
      setErrorBanner(null);
      saveSessions(getSessionsSnapshot().sessions, id);
    },
    []
  );

  const deleteSession = useCallback(
    (id: string) => {
      // Stop any stream still writing into the deleted session
      if (id === streamingIdRef.current) {
        stop();
      }
      const snapshot = getSessionsSnapshot();
      const remaining = snapshot.sessions.filter((s) => s.id !== id);
      const nextActiveId =
        snapshot.activeId === id ? '' : snapshot.activeId;
      saveSessions(remaining, nextActiveId);
    },
    [stop]
  );

  /** Rebind a session's subject grounding (picker or "attach to current page") */
  const setSessionContext = useCallback(
    (id: string, moduleContext: SessionModuleContext | null) => {
      updateSession(id, (s) => ({ ...s, moduleContext }));
    },
    [updateSession]
  );

  return {
    // settings
    settings,
    setSettings: updateSettings,
    // sessions
    sessions,
    activeId,
    activeSession,
    messages,
    isHydrated,
    selectSession,
    deleteSession,
    renameSession,
    setSessionContext,
    // chat
    streamingText,
    streamingModel,
    streamingSessionId,
    isBusy: isLoading,
    errorBanner,
    sendMessage,
    stop,
    regenerate,
    editUserMessage,
    deleteMessage,
    regenerateMessage,
    newChat,
    // status
    serverStatus,
  };
}

export type AssistantChatController = ReturnType<typeof useAssistantChat>;
