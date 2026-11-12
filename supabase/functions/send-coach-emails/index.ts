// Sends an athlete's coach emails for them, after the athlete approves the list in the app.
//
// Each email goes out from the app's own address (EMAIL_FROM) with the athlete's verified
// account email as Reply-To, so coach replies land in the athlete's own inbox.
//
// Secrets to set in Supabase > Edge Functions > Secrets:
//   RESEND_API_KEY  the API key from resend.com
//   EMAIL_FROM      for example: React App <coaches@your-domain.com>
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2.119.0';

/** Most emails one athlete can send in 24 hours. Keeps the app's address out of spam folders. */
const DAILY_LIMIT = 25;
/** The same coach address is not emailed twice by one athlete within this many days. */
const REPEAT_DAYS = 30;
const MAX_SUBJECT = 200;
const MAX_BODY = 6000;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Item = { schoolId: string; to: string; subject: string; body: string };
type Result = { schoolId: string; status: 'sent' | 'failed' | 'skipped'; error?: string };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const isEmail = (s: unknown): s is string => typeof s === 'string' && s.length <= 254 && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(s);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('EMAIL_FROM');
  if (!resendKey || !from) return json({ error: 'not_configured' }, 503);

  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: auth } = await asUser.auth.getUser();
  const user = auth.user;
  if (!user?.email || !user.email_confirmed_at) return json({ error: 'not_signed_in' }, 401);

  let items: Item[];
  try {
    const body = await req.json();
    items = Array.isArray(body?.emails) ? body.emails : [];
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  if (!items.length || items.length > DAILY_LIMIT) return json({ error: 'bad_request' }, 400);
  for (const it of items) {
    if (typeof it?.schoolId !== 'string' || !isEmail(it.to) || typeof it.subject !== 'string' || typeof it.body !== 'string') {
      return json({ error: 'bad_request' }, 400);
    }
    if (!it.subject.trim() || it.subject.length > MAX_SUBJECT || !it.body.trim() || it.body.length > MAX_BODY) {
      return json({ error: 'bad_request' }, 400);
    }
  }

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const { count } = await admin
    .from('email_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'sent')
    .gte('sent_at', dayAgo);
  const left = DAILY_LIMIT - (count ?? 0);
  if (items.length > left) return json({ error: 'daily_limit', left: Math.max(0, left) }, 429);

  const since = new Date(Date.now() - REPEAT_DAYS * 864e5).toISOString();
  const { data: recent } = await admin
    .from('email_log')
    .select('to_email')
    .eq('user_id', user.id)
    .eq('status', 'sent')
    .gte('sent_at', since);
  const already = new Set((recent ?? []).map((r: { to_email: string }) => r.to_email.toLowerCase()));

  const { data: profile } = await admin.from('profiles').select('data').eq('id', user.id).maybeSingle();
  const name = String((profile?.data as { name?: string } | null)?.name ?? '').trim() || 'this athlete';
  const footer = `\n\n--\nSent through React App for ${name}. Reply to this email to reach ${name} directly.`;

  const results: Result[] = [];
  for (const it of items) {
    const to = it.to.trim().toLowerCase();
    if (already.has(to)) {
      results.push({ schoolId: it.schoolId, status: 'skipped', error: 'already_sent' });
      continue;
    }
    already.add(to);
    let status: Result['status'] = 'failed';
    let error: string | undefined;
    let providerId: string | undefined;
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], reply_to: user.email, subject: it.subject.trim(), text: it.body + footer }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok) {
        status = 'sent';
        providerId = out?.id;
      } else {
        error = String(out?.message ?? res.status).slice(0, 300);
      }
    } catch (e) {
      error = String(e).slice(0, 300);
    }
    await admin.from('email_log').insert({
      user_id: user.id,
      school_id: it.schoolId,
      to_email: to,
      subject: it.subject.trim().slice(0, MAX_SUBJECT),
      status,
      error,
      provider_id: providerId,
    });
    results.push({ schoolId: it.schoolId, status, error });
  }

  return json({ results });
});
