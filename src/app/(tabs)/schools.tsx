import { useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, Choice, Field, FieldRow, Row, Screen, Text } from '@/components/ui';
import { useT, type StringKey } from '@/lib/i18n';
import { compare, EVENT_NAMES, formatMark, matches, scoreSchool, tierOf, toSchool, type Region, type School, type SchoolType, type Score, type Tier } from '@/lib/schools';
import { useStore } from '@/lib/store';
import { Fonts, useTheme } from '@/lib/theme';

const TIER_TONE: Record<Tier, 'good' | 'accent' | 'warn'> = { Likely: 'good', Target: 'accent', Reach: 'warn' };

function SchoolRow({ school, score, onRemove }: { school: School; score: Score | null; onRemove?: () => void }) {
  const { t, ev } = useT();
  const { c } = useTheme();
  const tier = score ? tierOf(score.total) ?? 'Reach' : null;
  const why = () => {
    if (!score) return t('no_score');
    const cmp = compare(school, score);
    return `${t('why_ath', {
      ev: ev(score.best.ev),
      pb: formatMark(score.best.ev, score.best.v),
      rel: t(`rel_${cmp.rel}` as StringKey),
      std: t(`std_${cmp.std}` as StringKey),
      m: formatMark(score.best.ev, cmp.mark),
    })} ${t('why_gpa', { g: score.gpa.toFixed(2), s: school.gpa.toFixed(1) })}`;
  };
  const schol = { full: 'schol_full', part: 'schol_part', fin: 'schol_fin' } as const;
  return (
    <View style={{ flexDirection: 'row', gap: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.line }}>
      <View style={{ width: 54, alignItems: 'center' }}>
        <Text kind="title" style={{ fontSize: 26, lineHeight: 30, fontVariant: ['tabular-nums'] }}>{score ? String(score.total) : '–'}</Text>
        <Text kind="label" style={{ fontSize: 10 }}>{t('fit')}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Row gap={6} style={{ alignItems: 'center' }}>
          <Text kind="h2">{school.name}</Text>
          {school.custom && <Badge tone="warn">{t('mine')}</Badge>}
        </Row>
        <Text kind="small" muted>
          {school.custom ? t(school.type === 'boarding' ? 'type_b' : 'type_c') : school.division} · {school.region}
          {school.custom ? '' : ` · ${t(schol[school.scholarship])}`}
        </Text>
        <Text kind="small" style={{ fontSize: 14 }}>{why()}</Text>
        {score && (
          <View style={{ height: 6, backgroundColor: c.chip, borderRadius: 3, overflow: 'hidden', maxWidth: 260, marginTop: 4 }}>
            <View style={{ width: `${score.total}%`, height: '100%', backgroundColor: c.accent }} />
          </View>
        )}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        {tier && <Badge tone={TIER_TONE[tier]}>{t(tier)}</Badge>}
        {onRemove && <Button small kind="ghost" title={t('remove')} onPress={onRemove} />}
      </View>
    </View>
  );
}

function AddSchool() {
  const { state, set } = useStore();
  const { t, ev } = useT();
  const [name, setName] = useState('');
  const [type, setType] = useState<SchoolType>('college');
  const [region, setRegion] = useState<Region>('Northeast');
  const [gpa, setGpa] = useState('');
  const [event, setEvent] = useState(state.profile.pbs[0]?.ev ?? '800m');
  const [mark, setMark] = useState('');
  const [error, setError] = useState<string>();

  function add() {
    if (!name.trim()) return setError(t('name_needed'));
    set({ custom: [...state.custom, { id: `custom-${Date.now()}`, name: name.trim(), type, region, gpa, ev: event, mark }] });
    setName('');
    setGpa('');
    setMark('');
    setError(undefined);
  }

  return (
    <Card style={{ borderStyle: 'dashed' }}>
      <Text kind="h2">{t('add_school')}</Text>
      <FieldRow>
        <Field label={t('f_sname')} value={name} onChangeText={setName} placeholder="Stanford University" error={error} />
        <Field label={t('f_sgpa')} value={gpa} onChangeText={setGpa} placeholder="3.5" keyboardType="decimal-pad" />
      </FieldRow>
      <Choice label={t('f_stype')} value={type} onChange={setType} options={[{ value: 'college', label: t('type_c') }, { value: 'boarding', label: t('type_b') }]} />
      <Choice label={t('f_region')} value={region} onChange={setRegion} options={(['Northeast', 'South', 'Midwest', 'West'] as const).map((r) => ({ value: r, label: r }))} />
      <Choice label={t('f_event')} value={event} onChange={setEvent} options={EVENT_NAMES.map((e) => ({ value: e, label: ev(e) }))} />
      <Field label={t('f_smark')} value={mark} onChangeText={setMark} placeholder="1:55.00" mono keyboardType="numbers-and-punctuation" />
      <Button title={`+ ${t('add_btn')}`} onPress={add} style={{ alignSelf: 'flex-start' }} />
    </Card>
  );
}

export default function Schools() {
  const { state, set } = useStore();
  const { t } = useT();
  const { c } = useTheme();
  const [filter, setFilter] = useState<'all' | Tier>('all');
  const list = matches(state.profile);
  const shown = list.filter((m) => filter === 'all' || m.tier === filter);
  const mine = state.custom.map((cs) => ({ cs, school: toSchool(cs) }));

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Text kind="display">{t('m_title')}</Text>
        <Text muted>{t('m_lead', { n: list.length })}</Text>
      </View>

      {mine.length > 0 && (
        <Card>
          <Text kind="label">{t('my_schools')}</Text>
          {mine.map(({ cs, school }) => (
            <SchoolRow
              key={cs.id}
              school={school}
              score={scoreSchool(school, state.profile)}
              onRemove={() => set({ custom: state.custom.filter((x) => x.id !== cs.id) })}
            />
          ))}
        </Card>
      )}
      <AddSchool />

      <Card>
        <Text kind="label">{t('recommended')}</Text>
        <Choice
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('all') },
            ...(['Likely', 'Target', 'Reach'] as const).map((x) => ({ value: x, label: `${t(x)} · ${list.filter((m) => m.tier === x).length}` })),
          ]}
        />
        {list.length === 0 ? (
          <Text muted>{t('none')}</Text>
        ) : (
          shown.map((m) => <SchoolRow key={m.school.id} school={m.school} score={m.score} />)
        )}
        <Text kind="small" color={c.warn} style={{ fontFamily: Fonts.medium }}>{t('sample_note')}</Text>
      </Card>
    </Screen>
  );
}
