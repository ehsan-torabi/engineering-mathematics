'use client';

import { useEffect, useState } from 'react';
import {
  fetchAiServerStatus,
  INITIAL_AI_SERVER_STATUS,
  type AiServerStatus,
} from '@/lib/ai-chat-client';

/**
 * Health check for the assistant API route, re-run whenever `enabled`
 * becomes true (e.g. the drawer opens). Returns the initial status while
 * unchecked so callers can render a neutral state.
 */
export function useAiServerStatus(enabled: boolean): AiServerStatus {
  const [status, setStatus] = useState<AiServerStatus>(INITIAL_AI_SERVER_STATUS);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetchAiServerStatus().then((next) => {
      if (!cancelled && next) setStatus(next);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return status;
}
