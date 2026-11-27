import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  appendMessage,
  createSession,
  createSessionId,
  DEFAULT_SESSION_TITLE,
  deleteMessageFromSession,
  editUserMessageInSession,
  faDigits,
  isSessionEmpty,
  LEGACY_STORAGE_KEY_CHAT,
  loadSessions,
  MAX_SESSION_MESSAGES,
  MAX_SESSIONS,
  MAX_TITLE_LENGTH,
  relativeTimeFa,
  saveSessions,
  sessionTitleFromText,
  sortSessions,
  sanitizeSessionTitle,
  trimSessions,
  truncateAfterMessage,
  truncateBeforeMessage,
  uniqueSessionTitle,
} from './ai-sessions.ts';
import type { ChatMessageItem } from './ai-settings.ts';
import type {
  StorageLike,
  ChatSession,
} from './ai-sessions.ts';

/** In-memory storage standing in for window.localStorage under node --test */
function memoryStorage(initial: Record<string, string> = {}): StorageLike & {
  clear: () => void;
  dump: () => Record<string, string>;
} {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
    clear: () => void map.clear(),
    dump: () => Object.fromEntries(map),
  };
}

function makeMessage(
  role: 'user' | 'assistant',
  content: string
): ChatMessageItem {
  return {
    id: `${role}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: '۱۲:۰۰',
  };
}

describe('sessionTitleFromText', () => {
  test('uses the first non-empty line', () => {
    assert.equal(
      sessionTitleFromText('\n  حل معادله گرما با شرایط مرزی  \nخط دوم'),
      'حل معادله گرما با شرایط مرزی'
    );
  });

  test('clips long titles on code points with an ellipsis', () => {
    const long = 'ر'.repeat(MAX_TITLE_LENGTH + 10);
    const title = sessionTitleFromText(long);
    assert.ok(title.startsWith('ر'.repeat(MAX_TITLE_LENGTH)));
    assert.ok(title.endsWith('…'));
    assert.ok(Array.from(title).length <= MAX_TITLE_LENGTH + 1);
  });

  test('astral characters are never split mid-glyph', () => {
    const text = `${'ا'.repeat(MAX_TITLE_LENGTH - 1)}😀${'ب'.repeat(5)}`;
    const title = sessionTitleFromText(text);
    assert.ok(Array.from(title).every((ch) => ch !== '\uFFFD'));
    assert.ok(title.includes('😀') || title.endsWith('…'));
  });

  test('falls back to the default title for empty prompts', () => {
    assert.equal(sessionTitleFromText(''), DEFAULT_SESSION_TITLE);
    assert.equal(sessionTitleFromText('   \n  '), DEFAULT_SESSION_TITLE);
  });
});

describe('appendMessage', () => {
  test('auto-titles the session from the first user message only', () => {
    const session = createSession(null);
    const titled = appendMessage(session, makeMessage('user', 'سری فوریه تابع زوج'));
    assert.equal(titled.title, 'سری فوریه تابع زوج');
    const retitled = appendMessage(titled, makeMessage('user', 'پرسش دوم'));
    assert.equal(retitled.title, 'سری فوریه تابع زوج');
  });

  test('trims history to the message cap', () => {
    let session = createSession(null);
    for (let i = 0; i < MAX_SESSION_MESSAGES + 5; i++) {
      session = appendMessage(session, makeMessage('user', `پیام ${i}`));
    }
    assert.equal(session.messages.length, MAX_SESSION_MESSAGES);
    assert.equal(
      session.messages[session.messages.length - 1].content,
      `پیام ${MAX_SESSION_MESSAGES + 4}`
    );
  });

  test('refreshes updatedAt on each append', () => {
    const session = createSession(null, new Date('2026-11-27T10:00:00Z'));
    const next = appendMessage(session, makeMessage('user', 'سلام'));
    assert.ok(Date.parse(next.updatedAt) >= Date.parse(session.updatedAt));
  });
});

describe('session helpers', () => {
  test('uniqueSessionTitle returns the base when free', () => {
    const sessions = [appendMessage(createSession(null), makeMessage('user', 'الف'))];
    assert.equal(uniqueSessionTitle(sessions, 'سری فوریه'), 'سری فوریه');
  });

  test('uniqueSessionTitle appends Persian-digit counters on conflict', () => {
    const a = appendMessage(createSession(null), makeMessage('user', 'الف'));
    a.title = 'گفت‌وگوی تازه';
    const b = appendMessage(createSession(null), makeMessage('user', 'ب'));
    b.title = 'گفت‌وگوی تازه (۲)';
    const sessions = [a, b];
    assert.equal(
      uniqueSessionTitle(sessions, 'گفت‌وگوی تازه'),
      'گفت‌وگوی تازه (۳)'
    );
    assert.equal(
      uniqueSessionTitle(sessions, 'گفت‌وگوی تازه', a.id),
      'گفت‌وگوی تازه'
    );
  });

  test('uniqueSessionTitle falls back to the default title when empty', () => {
    assert.equal(uniqueSessionTitle([], '   '), DEFAULT_SESSION_TITLE);
  });

  test('sanitizeSessionTitle keeps the first trimmed line', () => {
    assert.equal(sanitizeSessionTitle('  حل معادله  \nخط دوم '), 'حل معادله');
    assert.equal(sanitizeSessionTitle('   \n '), '');
  });

  test('isSessionEmpty and sortSessions behave as expected', () => {
    const empty = createSession(null);
    assert.equal(isSessionEmpty(empty), true);
    const older = appendMessage(empty, makeMessage('user', 'قدیمی'));
    const newer = appendMessage(createSession(null), makeMessage('user', 'جدید'));
    newer.updatedAt = '2026-11-27T12:00:00Z';
    older.updatedAt = '2026-11-27T08:00:00Z';
    const sorted = sortSessions([older, newer]);
    assert.equal(sorted[0].title, 'جدید');
  });

  test('trimSessions keeps the newest MAX_SESSIONS sessions', () => {
    const sessions: ChatSession[] = [];
    for (let i = 0; i < MAX_SESSIONS + 3; i++) {
      const s = appendMessage(createSession(null), makeMessage('user', `جلسه ${i}`));
      s.updatedAt = new Date(Date.UTC(2026, 0, 1 + i)).toISOString();
      sessions.push(s);
    }
    const trimmed = trimSessions(sessions);
    assert.equal(trimmed.length, MAX_SESSIONS);
    const titles = trimmed.map((s) => s.title);
    assert.ok(titles.includes('جلسه 3')); // first survivor
    assert.ok(!titles.includes('جلسه 2')); // oldest three dropped
    assert.ok(!titles.includes('جلسه 0'));
  });

  test('session ids are unique', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createSessionId()));
    assert.equal(ids.size, 50);
  });

  test('faDigits converts Latin digits', () => {
    assert.equal(faDigits(12), '۱۲');
    assert.equal(faDigits('a1b2'), 'a۱b۲');
  });
});

describe('relativeTimeFa', () => {
  const now = new Date('2026-11-27T12:00:00Z');

  test('labels recent minutes in Persian digits', () => {
    assert.equal(relativeTimeFa('2026-11-27T11:59:30Z', now), 'همین حالا');
    assert.equal(relativeTimeFa('2026-11-27T11:55:00Z', now), '۵ دقیقه پیش');
    assert.equal(relativeTimeFa('2026-11-27T09:00:00Z', now), '۳ ساعت پیش');
  });

  test('labels yesterday and day counts', () => {
    assert.equal(relativeTimeFa('2026-11-26T12:00:00Z', now), 'دیروز');
    assert.equal(relativeTimeFa('2026-11-23T12:00:00Z', now), '۴ روز پیش');
  });

  test('falls back to a Jalali date label beyond a week', () => {
    const label = relativeTimeFa('2026-11-01T12:00:00Z', now);
    assert.notEqual(label, '');
    assert.equal(label.includes('دقیقه'), false);
  });

  test('returns empty for invalid input', () => {
    assert.equal(relativeTimeFa('not-a-date', now), '');
  });
});

describe('loadSessions / saveSessions', () => {
  test('round-trips sessions and the active id', () => {
    const storage = memoryStorage();
    const session = appendMessage(
      createSession({ moduleTitle: 'سری فوریه' }),
      makeMessage('user', 'ذخیره‌سازی جلسه')
    );
    const stored = saveSessions([session], session.id, storage);
    const loaded = loadSessions(storage);
    assert.equal(stored.length, 1);
    assert.equal(loaded.activeId, session.id);
    assert.equal(loaded.sessions[0].title, 'ذخیره‌سازی جلسه');
    assert.equal(loaded.sessions[0].moduleContext?.moduleTitle, 'سری فوریه');
  });

  test('migrates the legacy v1 chat into one session and drops the welcome card', () => {
    const storage = memoryStorage({
      [LEGACY_STORAGE_KEY_CHAT]: JSON.stringify([
        { id: 'welcome-msg', role: 'assistant', content: 'خوش‌آمد', timestamp: '' },
        makeMessage('user', 'پرسش قدیمی از تبدیل فوریه'),
        makeMessage('assistant', 'پاسخ قدیمی'),
      ]),
    });
    const loaded = loadSessions(storage);
    assert.equal(loaded.sessions.length, 1);
    assert.equal(loaded.sessions[0].messages.length, 2);
    assert.equal(loaded.sessions[0].messages[0].content, 'پرسش قدیمی از تبدیل فوریه');
    assert.equal(loaded.sessions[0].title, 'پرسش قدیمی از تبدیل فوریه');
    assert.equal(loaded.sessions[0].moduleContext, null);
    assert.equal(
      storage.getItem(LEGACY_STORAGE_KEY_CHAT),
      null,
      'legacy key removed after migration'
    );
  });

  test('ignores corrupted storage and returns empty sessions', () => {
    const storage = memoryStorage({ [`${'x'}`]: 'irrelevant' });
    storage.setItem('eng_math_ai_sessions_v1', '{not json');
    const loaded = loadSessions(storage);
    assert.deepEqual(loaded, { sessions: [], activeId: '' });
  });

  test('drops stored sessions without messages or ids', () => {
    const storage = memoryStorage();
    storage.setItem(
      'eng_math_ai_sessions_v1',
      JSON.stringify([{ id: 'broken' }, { id: null, messages: [1] }])
    );
    const loaded = loadSessions(storage);
    assert.deepEqual(loaded.sessions, []);
  });

  test('falls back to the newest session when the active id is unknown', () => {
    const storage = memoryStorage();
    const a = appendMessage(createSession(null), makeMessage('user', 'الف'));
    const b = appendMessage(createSession(null), makeMessage('user', 'ب'));
    a.updatedAt = '2026-11-26T00:00:00Z';
    b.updatedAt = '2026-11-27T00:00:00Z';
    saveSessions([a, b], 'missing-id', storage);
    const loaded = loadSessions(storage);
    assert.equal(loaded.activeId, b.id);
  });
});

describe('message fork helpers (edit / regenerate / delete)', () => {
  function makeSession(messages: ChatMessageItem[]): ChatSession {
    // Pinned old updatedAt so a helper's refresh is observable even when
    // the test runs within the same millisecond as the fixture creation
    return {
      ...createSession(null),
      updatedAt: '2020-01-01T00:00:00.000Z',
      messages,
    };
  }

  const u1 = makeMessage('user', 'پرسش اول');
  const a1 = makeMessage('assistant', 'پاسخ اول');
  const u2 = makeMessage('user', 'پرسش دوم');
  const a2 = makeMessage('assistant', 'پاسخ دوم');

  test('truncateBeforeMessage keeps everything before the target only', () => {
    const session = makeSession([u1, a1, u2, a2]);
    const next = truncateBeforeMessage(session, u2.id);
    assert.ok(next);
    assert.deepEqual(
      next.messages.map((m) => m.id),
      [u1.id, a1.id]
    );
    assert.notEqual(next.updatedAt, session.updatedAt);
    assert.equal(truncateBeforeMessage(session, 'no-such-id'), null);
  });

  test('truncateAfterMessage keeps the target and drops the rest (retry)', () => {
    const session = makeSession([u1, a1, u2, a2]);
    const next = truncateAfterMessage(session, u2.id);
    assert.ok(next);
    assert.deepEqual(
      next.messages.map((m) => m.id),
      [u1.id, a1.id, u2.id]
    );
    assert.equal(truncateAfterMessage(session, 'no-such-id'), null);
  });

  test('editUserMessageInSession replaces content and drops the old branch', () => {
    const session = makeSession([u1, a1, u2, a2]);
    const next = editUserMessageInSession(session, u1.id, 'پرسش ویرایش‌شده');
    assert.ok(next);
    assert.equal(next.messages.length, 1);
    assert.equal(next.messages[0].id, u1.id);
    assert.equal(next.messages[0].content, 'پرسش ویرایش‌شده');
    // Editing is only valid for user messages
    assert.equal(editUserMessageInSession(session, a1.id, 'x'), null);
    assert.equal(editUserMessageInSession(session, 'no-such-id', 'x'), null);
  });

  test('deleteMessageFromSession removes exactly one message', () => {
    const session = makeSession([u1, a1, u2, a2]);
    const next = deleteMessageFromSession(session, a1.id);
    assert.ok(next);
    assert.deepEqual(
      next.messages.map((m) => m.id),
      [u1.id, u2.id, a2.id]
    );
    assert.equal(next.updatedAt !== session.updatedAt, true);
    assert.equal(deleteMessageFromSession(session, 'no-such-id'), null);
  });
});
