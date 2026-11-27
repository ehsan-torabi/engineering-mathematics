/**
 * Pure session model for the AI assistant: multiple named conversations,
 * each bound to the curriculum subject it was started from, so a chat that
 * began in one chapter never silently switches grounding to another.
 * Storage lives in localStorage (browser-only), following the app's
 * `eng_math_*_v1` key convention. Display strings are Persian; ids stay Latin.
 */

import type { ChatMessageItem } from './ai-settings.ts';

export interface SessionModuleContext {
  moduleId?: string;
  moduleTitle: string;
  moduleSubtitle?: string;
  subtopicId?: string;
  subtopicTitle?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** Subject the conversation is grounded in; null means general chat */
  moduleContext: SessionModuleContext | null;
  messages: ChatMessageItem[];
}

export const MAX_SESSION_MESSAGES = 60;
export const MAX_SESSIONS = 40;
export const MAX_TITLE_LENGTH = 48;
export const STORAGE_KEY_SESSIONS = 'eng_math_ai_sessions_v1';
export const STORAGE_KEY_ACTIVE_SESSION = 'eng_math_ai_active_session_v1';
/** Pre-sessions format; migrated once into a single session */
export const LEGACY_STORAGE_KEY_CHAT = 'eng_math_ai_chat_v1';

export const DEFAULT_SESSION_TITLE = 'گفت‌وگوی تازه';

let sessionIdCounter = 0;

export function createSessionId(): string {
  sessionIdCounter += 1;
  return `session-${Date.now()}-${sessionIdCounter}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

/** Persian wall-clock label for a message bubble («۱۴:۳۰») */
export function messageTimeLabel(): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  } catch {
    return '';
  }
}

/**
 * Auto-title from the first user prompt: first non-empty line, cut on code
 * points so astral characters never split mid-glyph.
 */
export function sessionTitleFromText(text: string): string {
  const firstLine =
    text
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? '';
  if (!firstLine) return DEFAULT_SESSION_TITLE;
  const chars = Array.from(firstLine);
  const clipped =
    chars.length > MAX_TITLE_LENGTH
      ? `${chars.slice(0, MAX_TITLE_LENGTH).join('')}…`
      : firstLine;
  return clipped;
}

export function isSessionEmpty(session: ChatSession): boolean {
  return session.messages.length === 0;
}

/**
 * Every session must have a name unique across the list: on conflict a
 * Persian-digit counter is appended («گفت‌وگوی تازه (۲)»). `selfId` marks
 * the session being (re)named so its own current title does not collide.
 */
export function uniqueSessionTitle(
  sessions: ChatSession[],
  candidate: string,
  selfId?: string
): string {
  const taken = new Set(
    sessions.filter((s) => s.id !== selfId).map((s) => s.title)
  );
  const base = candidate.trim() || DEFAULT_SESSION_TITLE;
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const withSuffix = `${base} (${faDigits(n)})`;
    if (!taken.has(withSuffix)) return withSuffix;
  }
}

/** Trimmed, non-empty rename; keeps the candidate's first line only */
export function sanitizeSessionTitle(candidate: string): string {
  const firstLine =
    candidate
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? '';
  return firstLine;
}

export function createSession(
  moduleContext?: SessionModuleContext | null,
  now: Date = new Date()
): ChatSession {
  return {
    id: createSessionId(),
    title: DEFAULT_SESSION_TITLE,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    moduleContext: moduleContext ?? null,
    messages: [],
  };
}

/** Newest conversation first — the order the session lists render in */
export function sortSessions(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  );
}

/**
 * Caps the stored session count, keeping the most recently updated ones
 * and never dropping `keepId` (the active session).
 */
export function trimSessions(
  sessions: ChatSession[],
  keepId?: string
): ChatSession[] {
  if (sessions.length <= MAX_SESSIONS) return sessions;
  const kept = sortSessions(sessions).slice(0, MAX_SESSIONS);
  const keptIds = new Set(kept.map((s) => s.id));
  if (keepId) keptIds.add(keepId);
  return sessions.filter((s) => keptIds.has(s.id));
}

/** Append a message, trim history, refresh updatedAt and auto-title */
export function appendMessage(
  session: ChatSession,
  message: ChatMessageItem
): ChatSession {
  const messages = [...session.messages, message].slice(
    -MAX_SESSION_MESSAGES
  );
  const firstUserMessage = messages.find((m) => m.role === 'user');
  return {
    ...session,
    title:
      session.title === DEFAULT_SESSION_TITLE && firstUserMessage
        ? sessionTitleFromText(firstUserMessage.content)
        : session.title,
    updatedAt: new Date().toISOString(),
    messages,
  };
}

export interface LoadedSessions {
  sessions: ChatSession[];
  activeId: string;
}

/**
 * Minimal storage surface so the pure functions stay testable under
 * `node --test`; the browser passes `window.localStorage`.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

/** Safely parse a stored session; returns null instead of throwing */
function parseStoredSession(value: unknown): ChatSession | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Partial<ChatSession>;
  // Empty messages are valid: a freshly created session starts empty
  if (typeof record.id !== 'string' || !Array.isArray(record.messages)) {
    return null;
  }
  return {
    id: record.id,
    title: typeof record.title === 'string' ? record.title : DEFAULT_SESSION_TITLE,
    createdAt:
      typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
    updatedAt:
      typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString(),
    moduleContext: record.moduleContext ?? null,
    messages: record.messages as ChatMessageItem[],
  };
}

/**
 * Reads the sessions plus the active id (no side effects). Shared by
 * loadSessions (with migration) and the useSyncExternalStore snapshot.
 */
function readSessionsState(storage: StorageLike): LoadedSessions {
  let sessions: ChatSession[] = [];

  try {
    const raw = storage.getItem(STORAGE_KEY_SESSIONS);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        sessions = parsed
          .map(parseStoredSession)
          .filter((s): s is ChatSession => s !== null);
      }
    }
  } catch {
    // Ignore corrupted session storage and fall through to migration
  }

  let activeId = '';
  try {
    activeId = storage.getItem(STORAGE_KEY_ACTIVE_SESSION) ?? '';
  } catch {
    // Ignore storage read errors
  }

  sessions = sortSessions(sessions);
  if (sessions.length === 0) {
    return { sessions: [], activeId: '' };
  }
  if (!sessions.some((s) => s.id === activeId)) {
    activeId = sessions[0].id;
  }
  return { sessions, activeId };
}

/**
 * Reads the sessions plus the active id, migrating the pre-sessions
 * `eng_math_ai_chat_v1` conversation into a session on first run. Safe to
 * call during SSR or without storage (returns an empty state).
 */
export function loadSessions(
  storage: StorageLike | null = defaultStorage()
): LoadedSessions {
  if (!storage) {
    return { sessions: [], activeId: '' };
  }
  const loaded = readSessionsState(storage);
  if (loaded.sessions.length > 0) {
    return loaded;
  }
  const migrated = migrateLegacyChat(storage);
  if (migrated.length === 0) {
    return { sessions: [], activeId: '' };
  }
  const state = readSessionsStateWith(migrated, storage);
  // Persist the migrated session immediately, and only after that write
  // succeeds drop the legacy key — a tab closed right after the upgrade
  // must not lose the pre-upgrade conversation
  saveSessions(state.sessions, state.activeId, storage);
  try {
    storage.removeItem(LEGACY_STORAGE_KEY_CHAT);
  } catch {
    // Ignore storage write errors
  }
  return state;
}

/** Sorts a given session list and validates the active id against it */
function readSessionsStateWith(
  sessions: ChatSession[],
  storage: StorageLike
): LoadedSessions {
  let activeId = '';
  try {
    activeId = storage.getItem(STORAGE_KEY_ACTIVE_SESSION) ?? '';
  } catch {
    // Ignore storage read errors
  }
  const sorted = sortSessions(sessions);
  if (sorted.length === 0) {
    return { sessions: [], activeId: '' };
  }
  if (!sorted.some((s) => s.id === activeId)) {
    activeId = sorted[0].id;
  }
  return { sessions: sorted, activeId };
}

const EMPTY_SESSIONS: LoadedSessions = { sessions: [], activeId: '' };

/* ── useSyncExternalStore plumbing (the app's house pattern for storage) ── */

const sessionListeners = new Set<() => void>();

let snapshotCache = { raw: '', activeRaw: '', value: EMPTY_SESSIONS };

/**
 * Stable snapshot for useSyncExternalStore: recomputed only when the
 * underlying raw storage changed, so identity is stable across renders.
 */
export function getSessionsSnapshot(): LoadedSessions {
  const storage = defaultStorage();
  if (!storage) return EMPTY_SESSIONS;
  let raw = '';
  let activeRaw = '';
  try {
    raw = storage.getItem(STORAGE_KEY_SESSIONS) ?? '';
    activeRaw = storage.getItem(STORAGE_KEY_ACTIVE_SESSION) ?? '';
  } catch {
    return EMPTY_SESSIONS;
  }
  if (raw !== snapshotCache.raw || activeRaw !== snapshotCache.activeRaw) {
    const value = raw
      ? readSessionsState(storage)
      : EMPTY_SESSIONS;
    snapshotCache = { raw, activeRaw, value };
  }
  return snapshotCache.value;
}

/** Server snapshot for hydration: nothing persisted on the server */
export function getServerSessionsSnapshot(): LoadedSessions {
  return EMPTY_SESSIONS;
}

/** Local writes go through here after saving; storage events cover other tabs */
export function notifySessionsChanged(): void {
  for (const listener of sessionListeners) {
    listener();
  }
}

/**
 * Store subscription for the assistant chat hook. Migrates the legacy
 * conversation once per mount (side effects stay out of getSnapshot) and
 * listens for storage changes from other tabs.
 */
export function subscribeToSessions(callback: () => void): () => void {
  sessionListeners.add(callback);
  loadSessions();
  const onStorage = (e: StorageEvent) => {
    if (
      e.key === null ||
      e.key === STORAGE_KEY_SESSIONS ||
      e.key === STORAGE_KEY_ACTIVE_SESSION ||
      e.key === LEGACY_STORAGE_KEY_CHAT
    ) {
      callback();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    sessionListeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function migrateLegacyChat(storage: StorageLike): ChatSession[] {
  try {
    const raw = storage.getItem(LEGACY_STORAGE_KEY_CHAT);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    const messages = parsed.filter(
      (m): m is ChatMessageItem =>
        Boolean(m) &&
        typeof m === 'object' &&
        (m as ChatMessageItem).id !== 'welcome-msg' &&
        typeof (m as ChatMessageItem).content === 'string'
    );
    if (messages.length === 0) return [];
    const now = new Date();
    const firstUser = messages.find((m) => m.role === 'user');
    const legacy: ChatSession = {
      id: createSessionId(),
      title: firstUser
        ? sessionTitleFromText(firstUser.content)
        : DEFAULT_SESSION_TITLE,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      moduleContext: null,
      messages,
    };
    return [legacy];
  } catch {
    return [];
  }
}

export function saveSessions(
  sessions: ChatSession[],
  activeId: string,
  storage?: StorageLike | null
): ChatSession[] {
  const target = storage ?? defaultStorage();
  if (!target) return sessions;
  const trimmed = trimSessions(sessions, activeId);
  const nextActiveId = trimmed.some((s) => s.id === activeId)
    ? activeId
    : sortSessions(trimmed)[0]?.id ?? '';
  try {
    target.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(trimmed));
    if (nextActiveId) {
      target.setItem(STORAGE_KEY_ACTIVE_SESSION, nextActiveId);
    } else {
      target.removeItem(STORAGE_KEY_ACTIVE_SESSION);
    }
  } catch {
    // Ignore storage write errors (quota, private mode)
  }
  notifySessionsChanged();
  return trimmed;
}

/**
 * Persian relative time for session rows: «همین حالا», «۵ دقیقه پیش»,
 * «دیروز», then a Jalali date label for anything older.
 */
export function relativeTimeFa(iso: string, now: Date = new Date()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const diffMs = now.getTime() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'همین حالا';
  if (minutes < 60) return `${faDigits(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${faDigits(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'دیروز';
  if (days < 7) return `${faDigits(days)} روز پیش`;
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(then));
  } catch {
    return '';
  }
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Latin digits to Persian digits for visible UI copy */
export function faDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}
