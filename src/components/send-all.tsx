import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Badge, Button, Card, Field, Row, Text } from '@/components/ui';
import { emailFor } from '@/lib/email';
import { useT } from '@/lib/i18n';
import type { School } from '@/lib/schools';
import { isEmail, sendCoachEmails } from '@/lib/send';
import { useStore } from '@/lib/store';
import { Radius, useTheme } from '@/lib/theme';

type Step = 'pick' | 'confirm' | 'sending';

/**
 * The athlete enters each coach's address, ticks the schools, approves the whole list once,
 * and the app sends every email for them.
 */
export function SendAll({ schools, url }: { schools: School[]; url: string }) {
  const { state, set } = useStore();
  const { t } = useT();
  const { c } = useTheme();
  const [step, setStep] = useState<Step>('pick');
  const [off, setOff] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<{ text: string; tone: 'good' | 'warn' } | null>(null);
  const [failed, setFailed] = useState<Set<string>>(new Set());

  const p = state.profile;
  const canSend = !!state.userId && !state.demo;
  const toOf = (id: string) => state.outreach[id]?.to ?? '';
  const sentAlready = (id: string) => (state.outreach[id]?.status ?? 0) > 0;
  const chosen = schools.filter((s) => !sentAlready(s.id) && !off.has(s.id) && isEmail(toOf(s.id)));

  function setTo(id: string, to: string) {
    const prev = state.outreach[id] ?? { status: 0 as const };
    set({ outreach: { ...state.outreach, [id]: { ...prev, to } } });
    setFailed((f) => {
      const n = new Set(f);
      n.delete(id);
      return n;
    });
  }

  function toggle(id: string) {
    setOff((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function send() {
    setStep('sending');
    setNote(null);
    const items = chosen.map((s) => ({ schoolId: s.id, to: toOf(s.id).trim(), ...emailFor(s, p, url) }));
    const out = await sendCoachEmails(items);
    setStep('pick');
    if ('error' in out) {
      const text =
        out.error === 'not_configured'
          ? t('send_off')
          : out.error === 'daily_limit'
            ? t('daily_limit', { n: out.left ?? 0 })
            : out.error === 'not_signed_in'
              ? t('confirm_email_send')
              : t('net_error');
      setNote({ text, tone: 'warn' });
      return;
    }
    const now = new Date().toISOString();
    const outreach = { ...state.outreach };
    const bad = new Set<string>();
    for (const r of out.results) {
      if (r.status === 'failed') bad.add(r.schoolId);
      else outreach[r.schoolId] = { ...outreach[r.schoolId], status: 1, sentAt: outreach[r.schoolId]?.sentAt ?? now };
    }
    set({ outreach });
    setFailed(bad);
    const ok = out.results.length - bad.size;
    setNote({
      text: [ok === 1 ? t('sent_1') : ok ? t('sent_n', { n: ok }) : '', bad.size ? t('failed_n', { n: bad.size }) : ''].filter(Boolean).join(' '),
      tone: bad.size ? 'warn' : 'good',
    });
  }

  return (
    <Card>
      <Text kind="label">{t('send_all_title')}</Text>
      <Text kind="small" muted>{t('send_all_lead')}</Text>

      {schools.map((s) => {
        const done = sentAlready(s.id);
        const on = !done && !off.has(s.id);
        const to = toOf(s.id);
        return (
          <View key={s.id} style={{ gap: 8, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10 }}>
            <Row style={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Pressable
                disabled={done || step !== 'pick'}
                onPress={() => toggle(s.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled: done }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: on ? c.accent : c.line,
                    backgroundColor: on ? c.accent : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: done ? 0.4 : 1,
                  }}>
                  {on && <Icon name="check" size={13} color={c.onAccent} />}
                </View>
                <Text kind="bold" style={{ flexShrink: 1 }}>{s.name}</Text>
              </Pressable>
              {done && <Badge tone="good">{t('already_sent')}</Badge>}
            </Row>
            {!done && (
              <Field
                label={t('coach_email')}
                value={to}
                onChangeText={(v) => setTo(s.id, v)}
                editable={step === 'pick'}
                placeholder="coach@school.edu"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                error={failed.has(s.id) || (to.trim() !== '' && !isEmail(to)) ? t('bad_email') : undefined}
              />
            )}
          </View>
        );
      })}

      {note && <Text kind="small" color={note.tone === 'good' ? c.good : c.warn}>{note.text}</Text>}

      {!canSend ? (
        <Text kind="small" muted>{t('demo_send')}</Text>
      ) : step === 'confirm' ? (
        <View style={{ backgroundColor: c.accentSoft, borderRadius: Radius.md, padding: 14, gap: 10 }}>
          <Text kind="bold">{t('confirm_title', { n: chosen.length })}</Text>
          <Text kind="small">{chosen.map((s) => s.name).join(', ')}</Text>
          <Text kind="small" muted>{t('confirm_body', { email: state.account?.email ?? p.email })}</Text>
          <Row gap={8}>
            <Button title={t('send_all_btn')} onPress={send} />
            <Button kind="outline" title={t('cancel')} onPress={() => setStep('pick')} />
          </Row>
        </View>
      ) : (
        <Button
          title={step === 'sending' ? t('sending') : t('review_send', { n: chosen.length })}
          disabled={step === 'sending' || chosen.length === 0}
          onPress={() => setStep('confirm')}
          style={{ alignSelf: 'flex-start' }}
        />
      )}
    </Card>
  );
}
