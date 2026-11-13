import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { Icon } from '@/components/icons';
import { Avatar, Badge, Button, Card, Row, Screen, Text } from '@/components/ui';
import { useLayout } from '@/components/use-layout';
import { useT, type StringKey } from '@/lib/i18n';
import { profileSteps, strengthOf } from '@/lib/progress';
import { matches, SCHOOLS, toSchool } from '@/lib/schools';
import { linkSlug } from '@/lib/email';
import { useStore } from '@/lib/store';
import { Fonts, Radius, useTheme } from '@/lib/theme';

function Ring({ pct }: { pct: number }) {
  const { c } = useTheme();
  const r = 30;
  const C = 2 * Math.PI * r;
  return (
    <Svg width={76} height={76} viewBox="0 0 76 76">
      <Circle cx={38} cy={38} r={r} fill="none" stroke={c.chip} strokeWidth={8} />
      <Circle
        cx={38}
        cy={38}
        r={r}
        fill="none"
        stroke={c.accent}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={`${(C * pct) / 100} ${C}`}
        transform="rotate(-90 38 38)"
      />
      <SvgText x={38} y={43.5} textAnchor="middle" fontSize={16} fontFamily={Fonts.bold} fill={c.ink}>
        {`${pct}%`}
      </SvgText>
    </Svg>
  );
}

export default function Home() {
  const { state } = useStore();
  const { t, lang } = useT();
  const { c } = useTheme();
  const { wide } = useLayout();
  const p = state.profile;
  const steps = profileSteps(state);
  const pct = strengthOf(steps);
  const left = steps.filter((s) => !s.done).length;
  const list = matches(p);
  const count = (tier: string) => list.filter((m) => m.tier === tier).length;
  const firstName = (p.name || state.account?.name || '').split(' ')[0];
  const today = new Date().toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });

  const allSchools = [...state.custom.map(toSchool), ...SCHOOLS];
  const sent = Object.entries(state.outreach)
    .filter(([, o]) => o.status > 0)
    .map(([id, o]) => ({ school: allSchools.find((s) => s.id === id), o }))
    .filter((x) => x.school);

  const tiers: [string, string, string][] = [
    ['Likely', c.goodSoft, c.good],
    ['Target', c.accentSoft, c.accent],
    ['Reach', c.warnSoft, c.warn],
  ];

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexShrink: 1 }}>
          <Text kind="small" muted style={{ textTransform: 'capitalize' }}>{today}</Text>
          <Text kind="display">{t('hi', { name: firstName })}</Text>
        </View>
        {wide ? (
          <Row gap={8}>
            <Button kind="outline" title={t('view_profile')} onPress={() => router.push(`/p/${linkSlug(state)}`)} />
            <Button title={t('share_link')} onPress={() => router.navigate('/email')} />
          </Row>
        ) : (
          <Pressable onPress={() => router.push(`/p/${linkSlug(state)}`)} accessibilityLabel={t('view_profile')}>
            <Avatar name={p.name || firstName} uri={p.photos.track[0]} />
          </Pressable>
        )}
      </Row>

      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>
        <Card style={{ flex: wide ? 1.05 : undefined, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Ring pct={pct} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text kind="h2">{t('strength')}</Text>
            <Text kind="small" muted>{left ? t('strength_body', { n: left }) : t('strength_done')}</Text>
          </View>
        </Card>

        <Card style={{ flex: wide ? 1.2 : undefined }}>
          <Text kind="label">{t('next_steps')}</Text>
          {steps.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => router.navigate(s.tab === 'email' ? '/email' : '/profile')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: 2,
                  borderColor: s.done ? c.good : c.line,
                  backgroundColor: s.done ? c.good : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}>
                {s.done && <Icon name="check" size={11} color="#ffffff" />}
              </View>
              <Text
                kind="small"
                muted={s.done}
                style={{ flex: 1, fontSize: 14, textDecorationLine: s.done ? 'line-through' : 'none' }}>
                {t(s.key as StringKey)}
              </Text>
            </Pressable>
          ))}
        </Card>

        <Card style={{ flex: wide ? 1 : undefined }}>
          <Text kind="label">{t('your_matches')}</Text>
          <Pressable onPress={() => router.navigate('/schools')} style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="button">
            {tiers.map(([tier, bg, fg]) => (
              <View key={tier} style={{ flex: 1, backgroundColor: bg, borderRadius: Radius.md, paddingVertical: 12, alignItems: 'center' }}>
                <Text kind="title" color={fg}>{String(count(tier))}</Text>
                <Text kind="small" color={fg} style={{ fontFamily: Fonts.semibold }}>{t(tier as StringKey)}</Text>
              </View>
            ))}
          </Pressable>
        </Card>
      </View>

      <Card>
        <Text kind="label">{t('emails_title')}</Text>
        {sent.length === 0 ? (
          <Text kind="small" muted>{t('no_emails')}</Text>
        ) : (
          sent.map(({ school, o }) => (
            <View key={school!.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text kind="bold" numberOfLines={1}>{school!.name}</Text>
                <Text kind="small" muted>
                  {school!.division}
                  {o.sentAt ? ` · ${t('sent_on', { d: new Date(o.sentAt).toLocaleDateString(lang, { day: 'numeric', month: 'short' }) })}` : ''}
                </Text>
              </View>
              <Badge tone={o.status >= 2 ? 'good' : 'muted'}>{t(`st_${o.status}` as StringKey)}</Badge>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
