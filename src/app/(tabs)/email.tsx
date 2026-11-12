import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { View } from 'react-native';

import { SendAll } from '@/components/send-all';
import { Button, Card, Choice, Field, Row, Screen, Text } from '@/components/ui';
import { emailFor, profileUrl } from '@/lib/email';
import { useT, type StringKey } from '@/lib/i18n';
import { matches, toSchool } from '@/lib/schools';
import { useStore, type OutreachStatus } from '@/lib/store';
import { Fonts, Radius, useTheme } from '@/lib/theme';

export default function Email() {
  const { state, set } = useStore();
  const { t } = useT();
  const { c } = useTheme();
  const p = state.profile;
  const schools = [...state.custom.map(toSchool), ...matches(p).map((m) => m.school)].slice(0, 10);
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? '');
  const [to, setTo] = useState('');
  const [copied, setCopied] = useState<'link' | 'email' | null>(null);
  const school = schools.find((s) => s.id === schoolId) ?? schools[0];
  const url = profileUrl(state);

  async function copy(text: string, what: 'link' | 'email') {
    await Clipboard.setStringAsync(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1800);
  }

  function setStatus(id: string, status: OutreachStatus) {
    const prev = state.outreach[id];
    set({
      outreach: {
        ...state.outreach,
        [id]: { ...prev, status, sentAt: status > 0 ? prev?.sentAt ?? new Date().toISOString() : undefined },
      },
    });
  }

  const mail = school ? emailFor(school, p, url) : null;

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Text kind="display">{t('s_title')}</Text>
        <Text muted>{t('s_lead')}</Text>
      </View>

      <View style={{ borderWidth: 1, borderColor: c.accent, backgroundColor: c.accentSoft, borderRadius: Radius.lg, padding: 16, gap: 8 }}>
        <Text kind="label">{t('link_lbl')}</Text>
        <Text kind="mono" selectable style={{ fontSize: 14 }}>{url}</Text>
        <Text kind="small" muted>{t('link_note')}</Text>
        <Button small kind="outline" title={copied === 'link' ? t('copied') : t('copy_link')} onPress={() => copy(url, 'link')} style={{ alignSelf: 'flex-start' }} />
      </View>

      {!school || !mail ? (
        <Card>
          <Text muted>{t('no_schools_yet')}</Text>
        </Card>
      ) : (
        <>
          <Card>
            <Choice
              label={t('email_for')}
              value={school.id}
              onChange={setSchoolId}
              options={schools.map((s) => ({ value: s.id, label: s.name }))}
            />
            <Field label={t('coach_email')} value={to} onChangeText={setTo} placeholder="coach@school.edu" autoCapitalize="none" keyboardType="email-address" />
            <View style={{ backgroundColor: c.bg, borderRadius: 10, borderWidth: 1, borderColor: c.line, padding: 14, gap: 10 }}>
              <Text kind="bold" selectable>{mail.subject}</Text>
              <Text selectable style={{ fontFamily: Fonts.mono, fontSize: 13, lineHeight: 20 }}>{mail.body}</Text>
            </View>
            <Row gap={8}>
              <Button
                title={t('open_mail')}
                onPress={() =>
                  Linking.openURL(`mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`)
                }
              />
              <Button kind="outline" title={copied === 'email' ? t('copied') : t('copy')} onPress={() => copy(`Subject: ${mail.subject}\n\n${mail.body}`, 'email')} />
              <Button kind="outline" title={t('mark_sent')} onPress={() => setStatus(school.id, Math.max(1, state.outreach[school.id]?.status ?? 0) as OutreachStatus)} />
            </Row>
          </Card>

          <SendAll schools={schools} url={url} />

          <Card>
            <Text kind="label">{t('tracker')}</Text>
            {schools.map((s) => (
              <View key={s.id} style={{ gap: 8, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10 }}>
                <Text kind="bold">{s.name}</Text>
                <Choice
                  value={String(state.outreach[s.id]?.status ?? 0)}
                  onChange={(v) => setStatus(s.id, Number(v) as OutreachStatus)}
                  options={[0, 1, 2, 3, 4].map((k) => ({ value: String(k), label: t(`st_${k}` as StringKey) }))}
                />
              </View>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
