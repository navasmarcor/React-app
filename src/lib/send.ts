import { FunctionsHttpError } from '@supabase/supabase-js';

import { SEND_FUNCTION } from './config';
import { supabase } from './supabase';

export type SendItem = { schoolId: string; to: string; subject: string; body: string };
export type SendResult = { schoolId: string; status: 'sent' | 'failed' | 'skipped'; error?: string };
export type SendError = 'not_configured' | 'not_signed_in' | 'daily_limit' | 'network';

export const isEmail = (s: string) => /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(s.trim());

/** Asks the server to send the approved coach emails. The server sends them from the app's address. */
export async function sendCoachEmails(emails: SendItem[]): Promise<{ results: SendResult[] } | { error: SendError; left?: number }> {
  const { data, error } = await supabase.functions.invoke(SEND_FUNCTION, { body: { emails } });
  if (!error) return { results: (data as { results: SendResult[] }).results };
  if (error instanceof FunctionsHttpError) {
    const out = await error.context.json().catch(() => ({}));
    if (out?.error === 'not_configured' || out?.error === 'not_signed_in' || out?.error === 'daily_limit') return { error: out.error, left: out.left };
  }
  return { error: 'network' };
}
