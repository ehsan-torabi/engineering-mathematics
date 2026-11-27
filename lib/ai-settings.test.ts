import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPENAI_COMPATIBLE_PRESETS,
  buildOpenAIChatCompletionsUrl,
  isLoopbackBaseUrl,
} from './ai-settings.ts';

test('isLoopbackBaseUrl detects local model-server hosts on any port', () => {
  assert.equal(isLoopbackBaseUrl('http://localhost:11434/v1'), true);
  assert.equal(isLoopbackBaseUrl('http://127.0.0.1:1234/v1'), true);
  assert.equal(isLoopbackBaseUrl('http://[::1]:11434/v1'), true);
  assert.equal(isLoopbackBaseUrl('http://0.0.0.0:8080/v1'), true);
  assert.equal(isLoopbackBaseUrl('http://mybox.localhost:11434/v1'), true);
  assert.equal(isLoopbackBaseUrl('http://localhost:11434/chat/completions'), true);
});

test('isLoopbackBaseUrl rejects cloud and LAN endpoints', () => {
  assert.equal(isLoopbackBaseUrl('https://api.openai.com/v1'), false);
  assert.equal(
    isLoopbackBaseUrl('https://generativelanguage.googleapis.com/v1beta/openai'),
    false
  );
  assert.equal(isLoopbackBaseUrl('https://openrouter.ai/api/v1'), false);
  // LAN IPs are not loopback: from an HTTPS page the browser blocks them
  // (mixed content), so they must not take the direct-transport path.
  assert.equal(isLoopbackBaseUrl('http://192.168.1.10:11434/v1'), false);
  assert.equal(isLoopbackBaseUrl(''), false);
  assert.equal(isLoopbackBaseUrl('not a url'), false);
});

test('local presets (Ollama / LM Studio) resolve to loopback base URLs', () => {
  for (const presetId of ['ollama', 'lmstudio'] as const) {
    const preset = OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === presetId);
    assert.ok(preset, `${presetId} preset expected`);
    assert.equal(isLoopbackBaseUrl(preset.baseUrl), true);
  }
});

test('buildOpenAIChatCompletionsUrl appends /chat/completions once', () => {
  assert.equal(
    buildOpenAIChatCompletionsUrl('http://localhost:11434/v1'),
    'http://localhost:11434/v1/chat/completions'
  );
  assert.equal(
    buildOpenAIChatCompletionsUrl('http://localhost:11434'),
    'http://localhost:11434/v1/chat/completions'
  );
  assert.equal(
    buildOpenAIChatCompletionsUrl('http://127.0.0.1:1234/v1/chat/completions'),
    'http://127.0.0.1:1234/v1/chat/completions'
  );
});
