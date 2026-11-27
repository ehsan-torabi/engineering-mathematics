'use client';

import React, { useEffect, useState } from 'react';
import {
  CURRICULUM_MODULES,
  type CurriculumModule,
} from '@/lib/curriculum-data';
import type { SessionModuleContext } from '@/lib/ai-sessions';
import { faDigits, relativeTimeFa } from '@/lib/ai-sessions';
import { OPENAI_COMPATIBLE_PRESETS } from '@/lib/ai-settings';
import { useAssistantChat } from '@/hooks/use-assistant-chat';
import ChatTranscript from '@/components/ai/ChatTranscript';
import AssistantComposer from '@/components/ai/AssistantComposer';
import AssistantWelcome from '@/components/ai/AssistantWelcome';
import AISettingsPanel from '@/components/ai/AISettingsPanel';
import Modal from '@/components/ui/Modal';
import {
  BookOpen,
  Menu,
  MessageSquareText,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  X,
  Check,
} from 'lucide-react';

/**
 * The full-page assistant: session history in a start-side rail, the
 * conversation transcript, a subject picker that rebinds the session's
 * درس‌نامه grounding, and the shared settings panel in a modal.
 * Shares one chat engine (hooks/use-assistant-chat) with the drawer.
 */

interface SessionRowProps {
  title: string;
  updatedAt: string;
  moduleContext: SessionModuleContext | null;
  isActive: boolean;
  isConfirmingDelete: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onRename: (title: string) => void;
}

function SessionRow({
  title,
  updatedAt,
  moduleContext,
  isActive,
  isConfirmingDelete,
  onSelect,
  onDelete,
  onConfirmDelete,
  onRename,
}: SessionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const startEditing = () => {
    setDraft(title);
    setIsEditing(true);
  };

  const commitRename = () => {
    setIsEditing(false);
    if (draft.trim() && draft !== title) {
      onRename(draft);
    }
  };

  const subjectLabel = moduleContext
    ? moduleContext.subtopicTitle || moduleContext.moduleTitle
    : 'بدون مبحث';
  return (
    <div
      className={`group/row relative flex items-stretch rounded-lg border transition-colors ${
        isActive
          ? 'border-accent bg-accent-soft'
          : 'border-transparent hover:border-line hover:bg-muted'
      }`}
    >
      {isEditing ? (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              commitRename();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
          onBlur={commitRename}
          autoFocus
          aria-label="نام جلسه"
          className="mx-2 my-1.5 min-w-0 flex-1 rounded-md border border-accent bg-paper px-2 py-1 text-xs font-bold text-ink outline-none focus:bg-surface"
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          aria-current={isActive ? 'true' : undefined}
          className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg px-3 py-2.5 text-start"
        >
          <span className="truncate text-xs font-bold text-ink">{title}</span>
          <span className="flex items-center gap-1.5 text-[10px] text-ink-3">
            <span className="shrink-0">{relativeTimeFa(updatedAt)}</span>
            <span aria-hidden="true">·</span>
            <span className="flex min-w-0 items-center gap-1 truncate">
              <BookOpen className="h-3 w-3 shrink-0 text-accent" />
              <span className="truncate">{subjectLabel}</span>
            </span>
          </span>
        </button>
      )}
      <div className="flex items-center pe-1.5">
        {isConfirmingDelete ? (
          <button
            type="button"
            onClick={onConfirmDelete}
            aria-label="تأیید حذف جلسه"
            title="تأیید حذف"
            className="flex h-7 items-center gap-1 rounded-md border border-danger-line bg-danger-soft px-2 text-[10px] font-bold text-danger-ink transition-colors hover:bg-danger-tint"
          >
            <Check className="h-3 w-3" />
            تأیید
          </button>
        ) : isEditing ? (
          <button
            type="button"
            onClick={commitRename}
            aria-label="ذخیره نام جلسه"
            title="ذخیره نام"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ok transition-colors hover:bg-muted md:opacity-0 md:group-hover/row:opacity-100"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={startEditing}
              aria-label={`تغییر نام جلسه: ${title}`}
              title="تغییر نام"
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 opacity-100 transition-opacity hover:bg-muted hover:text-ink focus-visible:opacity-100 md:opacity-0 md:hover:bg-muted md:group-hover/row:opacity-100"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`حذف جلسه: ${title}`}
              title="حذف جلسه"
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 opacity-100 transition-opacity hover:bg-danger-soft hover:text-danger-ink focus-visible:opacity-100 md:opacity-0 md:hover:bg-danger-soft md:group-hover/row:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AssistantPageClient() {
  const chat = useAssistantChat();
  const {
    settings,
    setSettings,
    sessions,
    activeId,
    activeSession,
    messages,
    isHydrated,
    streamingText,
    streamingModel,
    streamingSessionId,
    isBusy,
    errorBanner,
    sendMessage,
    stop,
    regenerate,
    editUserMessage,
    deleteMessage,
    regenerateMessage,
    newChat,
    selectSession,
    deleteSession,
    renameSession,
    setSessionContext,
    serverStatus,
  } = chat;

  const [inputPrompt, setInputPrompt] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Two-step delete resets after a short grace period
  useEffect(() => {
    if (!pendingDeleteId) return;
    const timer = setTimeout(() => setPendingDeleteId(null), 3000);
    return () => clearTimeout(timer);
  }, [pendingDeleteId]);

  // Escape closes the mobile sessions overlay
  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const handleSend = () => {
    const text = inputPrompt.trim();
    if (!text || isBusy) return;
    setInputPrompt('');
    void sendMessage(text);
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    newChat();
    setInputPrompt('');
    setIsSidebarOpen(false);
  };

  // Never show another session's stream inside the open transcript
  const visibleStreamingText =
    streamingSessionId === activeId ? streamingText : null;
  const visibleStreamingModel =
    visibleStreamingText !== null ? streamingModel : null;

  const boundContext = activeSession?.moduleContext ?? null;
  const boundModule = CURRICULUM_MODULES.find(
    (m) => m.id === boundContext?.moduleId
  );

  const handleModuleChange = (moduleId: string) => {
    if (!activeSession) return;
    if (!moduleId) {
      setSessionContext(activeSession.id, null);
      return;
    }
    const mod = CURRICULUM_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;
    setSessionContext(activeSession.id, {
      moduleId: mod.id,
      moduleTitle: mod.title,
      moduleSubtitle: mod.subtitle,
    });
  };

  const handleSubtopicChange = (subtopicId: string) => {
    if (!activeSession) return;
    const subtopic = boundModule?.subtopics.find((st) => st.id === subtopicId);
    setSessionContext(activeSession.id, {
      ...(boundContext ?? { moduleTitle: '' }),
      subtopicId: subtopic?.id,
      subtopicTitle: subtopic?.title,
    });
  };

  const activePreset =
    OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === settings.presetId) ||
    OPENAI_COMPATIBLE_PRESETS[0];
  const hasCredential =
    settings.apiKey.trim().length > 0 ||
    serverStatus.openAICompatibleKeyConfigured ||
    serverStatus.geminiReady;

  const quickPromptSubject =
    boundContext?.subtopicTitle || boundContext?.moduleTitle || 'این درس';
  const quickPrompts = [
    `یک مثال امتحانی از مبحث «${quickPromptSubject}» با حل کاملاً تشریحی و بدون حذف محاسبات پایه بده.`,
    `تمام مراحل انتگرال‌گیری جزء‌به‌جزء ($u$ و $dv$) و جایگذاری حدود در این بخش را گام‌به‌گام توضیح بده.`,
    `یک سوال چهارگزینه‌ای استاندارد از «${quickPromptSubject}» طرح کن، جواب را نگیر؛ بعد از پاسخ من، درست بودن آن را با توضیح کامل بررسی کن.`,
    `نکات کلیدی امتحانی و دام‌های رایج در مبحث «${quickPromptSubject}» چیست؟`,
    `چگونه از تقارن زوج و فرد یا شرایط مرزی برای ساده‌سازی محاسبات این فصل استفاده کنیم؟`,
  ];

  const sessionList = (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-3">
        <h2 className="flex items-center gap-1.5 text-xs font-bold text-ink">
          <MessageSquareText className="h-3.5 w-3.5 text-accent" />
          جلسات گفتگو
          {sessions.length > 0 && (
            <span className="text-[10px] font-normal text-ink-4">
              ({faDigits(sessions.length)})
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={handleNewChat}
          className="flex items-center gap-1 rounded-md border border-line-strong bg-surface px-2 py-1.5 text-[11px] font-bold text-ink-2 transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-3.5 w-3.5" />
          تازه
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <p className="px-3 py-6 text-center text-[11px] leading-6 text-ink-3">
            هنوز گفت‌وگویی نداری؛ اولین پرسش را بپرس یا یک گفت‌وگوی تازه بساز.
          </p>
        ) : (
          sessions.map((session) => (
            <SessionRow
              key={session.id}
              title={session.title}
              updatedAt={session.updatedAt}
              moduleContext={session.moduleContext}
              isActive={session.id === activeId}
              isConfirmingDelete={pendingDeleteId === session.id}
              onSelect={() => {
                selectSession(session.id);
                setIsSidebarOpen(false);
              }}
              onDelete={() => setPendingDeleteId(session.id)}
              onConfirmDelete={() => {
                deleteSession(session.id);
                setPendingDeleteId(null);
              }}
              onRename={(nextTitle) => renameSession(session.id, nextTitle)}
            />
          ))
        )}
      </div>
    </>
  );

  // Server render and first client render agree on this skeleton; persisted
  // sessions, settings and messages appear once the mount effect has loaded
  // them (avoids a hydration mismatch on localStorage-derived state)
  if (!isHydrated) {
    return (
      <main
        className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-7xl min-h-[480px]"
        aria-label="دستیار هوشمند"
        aria-busy="true"
      >
        <h1 className="sr-only">دستیار هوشمند ریاضیات مهندسی</h1>
        <aside className="hidden w-72 shrink-0 flex-col border-e border-line bg-surface md:flex">
          <div className="flex items-center gap-1.5 border-b border-line px-3 py-3">
            <MessageSquareText className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-bold text-ink">جلسات گفتگو</span>
          </div>
          <p className="px-3 py-6 text-center text-[11px] text-ink-3">
            در حال بازیابی جلسات…
          </p>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col bg-paper">
          <div className="border-b border-line bg-surface px-4 py-3 text-xs font-bold text-ink">
            دستیار هوشمند
          </div>
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-[11px] text-ink-3">در حال بازیابی گفت‌وگو…</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-7xl min-h-[480px]"
      aria-label="دستیار هوشمند"
    >
      <h1 className="sr-only">دستیار هوشمند ریاضیات مهندسی</h1>

      {/* Sessions rail — inline-start; overlay on mobile */}
      <aside className="hidden w-72 shrink-0 flex-col border-e border-line bg-surface md:flex">
        {sessionList}
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="فهرست جلسات گفتگو"
        >
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-surface shadow-2xl">
            <div className="flex justify-end border-b border-line px-2 py-1.5 md:hidden">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="بستن فهرست جلسات"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-muted hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {sessionList}
          </aside>
        </div>
      )}

      {/* Conversation column */}
      <section className="flex min-w-0 flex-1 flex-col bg-paper">
        {/* Header: session title, subject picker, provider status */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface px-3 py-2.5 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="نمایش فهرست جلسات"
              aria-expanded={isSidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-muted hover:text-ink md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-ink" dir="auto">
                {activeSession ? activeSession.title : 'گفت‌وگوی تازه'}
              </p>
              <p
                className="flex items-center gap-1.5 text-[10px] text-ink-3"
                dir="auto"
              >
                <span
                  className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                    serverStatus.checked
                      ? hasCredential
                        ? 'bg-ok'
                        : 'bg-warn'
                      : 'bg-ink-4'
                  }`}
                />
                <span className="truncate">
                  {activePreset.label} · {settings.model}
                </span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {/* Subject picker: binds the session's درس‌نامه grounding */}
            <div className="flex items-center gap-1.5">
              <BookOpen className="hidden h-3.5 w-3.5 text-accent sm:block" />
              <select
                aria-label="انتخاب مبحث فعال برای هماهنگی پاسخ‌ها"
                value={boundContext?.moduleId ?? ''}
                onChange={(e) => handleModuleChange(e.target.value)}
                disabled={!activeSession}
                className="max-w-[9.5rem] truncate rounded-lg border border-line-strong bg-panel px-2 py-1.5 text-[11px] font-semibold text-ink outline-none transition-colors focus:border-accent disabled:opacity-50 sm:max-w-[13rem]"
              >
                <option value="">بدون مبحث</option>
                {CURRICULUM_MODULES.map((mod: CurriculumModule) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.numberLabel} — {mod.shortTitle}
                  </option>
                ))}
              </select>
              {boundModule && (
                <select
                  aria-label="انتخاب زیرمبحث فعال"
                  value={boundContext?.subtopicId ?? ''}
                  onChange={(e) => handleSubtopicChange(e.target.value)}
                  disabled={!activeSession}
                  className="max-w-[9.5rem] truncate rounded-lg border border-line-strong bg-panel px-2 py-1.5 text-[11px] font-semibold text-ink outline-none transition-colors focus:border-accent disabled:opacity-50 sm:max-w-[13rem]"
                >
                  <option value="">همهٔ زیرمبحث‌ها</option>
                  {boundModule.subtopics.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="تنظیمات دستیار"
              title="تنظیمات مدل و نحوهٔ پاسخ‌دهی"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-muted hover:text-ink"
            >
              <Settings2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <ChatTranscript
          messages={messages}
          streamingText={visibleStreamingText}
          streamingModel={visibleStreamingModel}
          isBusy={isBusy}
          errorBanner={errorBanner}
          onRegenerate={regenerate}
          onStop={stop}
          onEditMessage={(id, text) => void editUserMessage(id, text)}
          onDeleteMessage={deleteMessage}
          onRegenerateMessage={(id) => void regenerateMessage(id)}
          emptyState={<AssistantWelcome moduleContext={boundContext} />}
        />

        <AssistantComposer
          value={inputPrompt}
          onChange={setInputPrompt}
          onSend={handleSend}
          isBusy={isBusy}
          onStop={stop}
          quickPrompts={quickPrompts}
          onQuickPromptSend={(qp) => {
            setInputPrompt('');
            void sendMessage(qp);
          }}
          autoFocus
          id="assistant-composer"
        />
      </section>

      {/* Settings modal — the same panel the drawer's settings tab uses */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ariaLabel="تنظیمات دستیار هوشمند"
        title="تنظیمات دستیار هوشمند"
        icon={<Settings2 className="h-5 w-5 text-accent" aria-hidden="true" />}
        widthClass="max-w-2xl"
      >
        <AISettingsPanel
          settings={settings}
          onChange={setSettings}
          serverStatus={serverStatus}
          onDone={() => setIsSettingsOpen(false)}
          doneLabel="ذخیره و بازگشت به گفت‌وگو"
        />
      </Modal>
    </main>
  );
}
