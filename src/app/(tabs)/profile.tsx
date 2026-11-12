import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { LangPicker } from '@/components/auth-shell';
import { EventPicker } from '@/components/event-picker';
import { Icon } from '@/components/icons';
import { Button, Card, Choice, Field, FieldRow, Row, Screen, Text } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { EVENTS, gpa4 } from '@/lib/schools';
import { deletePhoto, uploadPhoto } from '@/lib/photos';
import { useStore, type Profile } from '@/lib/store';
import { Radius, useTheme } from '@/lib/theme';

const MAX_PHOTOS = 6;

function Section({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <Card>
      <Text kind="label">{title}</Text>
      {hint ? <Text kind="small" muted>{hint}</Text> : null}
      {children}
    </Card>
  );
}

function Photos({ kind }: { kind: 'track' | 'life' }) {
  const { state, setProfile } = useStore();
  const { t } = useT();
  const { c } = useTheme();
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const list = state.profile.photos[kind];

  async function add() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setDenied(true);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - list.length,
      quality: 0.7,
    });
    if (res.canceled) return;
    setFailed(false);
    let uris = res.assets.map((a) => a.uri);
    const userId = state.userId;
    if (userId && !state.demo) {
      setBusy(true);
      try {
        uris = await Promise.all(res.assets.map((a) => uploadPhoto(userId, kind, a.uri, a.mimeType)));
      } catch {
        setFailed(true);
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    setProfile({ photos: { ...state.profile.photos, [kind]: [...list, ...uris].slice(0, MAX_PHOTOS) } });
  }

  function remove(i: number) {
    deletePhoto(list[i]).catch(() => {});
    setProfile({ photos: { ...state.profile.photos, [kind]: list.filter((_, j) => j !== i) } });
  }

  return (
    <View style={{ gap: 8 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text kind="bold">{t(kind === 'track' ? 'ph_track' : 'ph_life')}</Text>
        {list.length < MAX_PHOTOS && <Button small kind="outline" disabled={busy} title={busy ? t('uploading') : `+ ${t('ph_add')}`} onPress={add} />}
      </Row>
      {denied && <Text kind="small" color={c.warn}>{t('ph_denied')}</Text>}
      {failed && <Text kind="small" color={c.warn}>{t('net_error')}</Text>}
      {list.length ? (
        <Row gap={8}>
          {list.map((uri, i) => (
            <View key={uri + i} style={{ width: 96, height: 96, borderRadius: Radius.sm, overflow: 'hidden', backgroundColor: c.chip }}>
              <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <Pressable
                onPress={() => remove(i)}
                accessibilityLabel={t('remove')}
                style={{ position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="close" size={14} color="#ffffff" />
              </Pressable>
            </View>
          ))}
        </Row>
      ) : (
        <Text kind="small" muted>{t('ph_none')}</Text>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const { state, sync, set, setProfile, signOut } = useStore();
  const { c } = useTheme();
  const { t } = useT();
  const p = state.profile;
  const field = (k: keyof Profile) => ({
    value: String(p[k] ?? ''),
    onChangeText: (v: string) => setProfile({ [k]: v } as Partial<Profile>),
  });

  const setPb = (i: number, patch: Partial<Profile['pbs'][number]>) =>
    setProfile({ pbs: p.pbs.map((x, j) => (j === i ? { ...x, ...patch } : x)) });

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Text kind="display">{t('p_title')}</Text>
        <Text muted>{t('p_lead')}</Text>
        <Text kind="small" color={sync === 'error' ? c.warn : c.muted}>
          {state.demo ? t('demo_note') : sync === 'saving' ? t('saving') : sync === 'error' ? t('save_error') : t('saved')}
        </Text>
      </View>

      <Section title={t('h_personal')}>
        <FieldRow>
          <Field label={t('f_fullname')} {...field('name')} autoComplete="name" />
          <Field label={t('f_born')} {...field('born')} keyboardType="number-pad" maxLength={4} />
          <Field label={t('f_country')} {...field('country')} />
          <Field label={t('f_grad')} {...field('grad')} keyboardType="number-pad" maxLength={4} />
          <Field label={t('f_school')} {...field('school')} />
          <Field label={t('f_email')} {...field('email')} keyboardType="email-address" autoCapitalize="none" />
        </FieldRow>
      </Section>

      <Section title={t('h_athletics')}>
        {p.pbs.map((pb, i) => (
          <View key={i} style={{ gap: 10, paddingBottom: 6 }}>
            <EventPicker label={t('f_event')} value={pb.ev} onChange={(v) => setPb(i, { ev: v })} />
            <FieldRow>
              <Field
                label={t('f_mark')}
                mono
                value={pb.mark}
                onChangeText={(v) => setPb(i, { mark: v })}
                placeholder={EVENTS[pb.ev]?.hint}
                keyboardType="numbers-and-punctuation"
              />
              <Field label={t('f_meet')} value={pb.meet} onChangeText={(v) => setPb(i, { meet: v })} />
            </FieldRow>
            {p.pbs.length > 1 && (
              <Button small kind="ghost" title={t('remove')} style={{ alignSelf: 'flex-start' }} onPress={() => setProfile({ pbs: p.pbs.filter((_, j) => j !== i) })} />
            )}
          </View>
        ))}
        <Button small kind="outline" title={`+ ${t('add_pb')}`} style={{ alignSelf: 'flex-start' }} onPress={() => setProfile({ pbs: [...p.pbs, { ev: '400m', mark: '', meet: '' }] })} />
      </Section>

      <Section title={t('h_video')}>
        {p.videos.map((v, i) => (
          <Row key={i} style={{ alignItems: 'flex-end' }}>
            <Field
              style={{ flexGrow: 1, flexBasis: 220 }}
              label={`${t('h_video')} ${i + 1}`}
              value={v}
              onChangeText={(x) => setProfile({ videos: p.videos.map((y, j) => (j === i ? x : y)) })}
              placeholder="https://youtube.com/..."
              autoCapitalize="none"
              keyboardType="url"
            />
            {p.videos.length > 1 && <Button small kind="ghost" title={t('remove')} onPress={() => setProfile({ videos: p.videos.filter((_, j) => j !== i) })} />}
          </Row>
        ))}
        <Button small kind="outline" title={`+ ${t('add_video')}`} style={{ alignSelf: 'flex-start' }} onPress={() => setProfile({ videos: [...p.videos, ''] })} />
      </Section>

      <Section title={t('h_academics')}>
        <Choice
          label={t('f_scale')}
          value={p.scale}
          onChange={(scale) => setProfile({ scale })}
          options={[
            { value: 'us', label: t('scale_us') },
            { value: 'fr', label: t('scale_fr') },
            { value: 'es', label: t('scale_es') },
          ]}
        />
        <FieldRow>
          <Field label={t('f_gpa')} {...field('gpa')} keyboardType="decimal-pad" hint={t('gpa_conv', { g: gpa4(p).toFixed(2) })} />
          <Field label={t('f_sat')} {...field('sat')} keyboardType="number-pad" maxLength={4} />
        </FieldRow>
        <Choice
          label={t('f_english')}
          value={p.english}
          onChange={(english) => setProfile({ english })}
          options={(['Native', 'C1', 'B2', 'B1', 'A2'] as const).map((x) => ({ value: x, label: x }))}
        />
      </Section>

      <Section title={t('h_photos')} hint={t('ph_hint')}>
        <Photos kind="track" />
        <Photos kind="life" />
      </Section>

      <Section title={t('h_prefs')}>
        <Choice
          label={t('f_level')}
          value={p.level}
          onChange={(level) => setProfile({ level })}
          options={[
            { value: 'both', label: t('both') },
            { value: 'boarding', label: t('boarding') },
            { value: 'college', label: t('college') },
          ]}
        />
        <Choice
          label={t('f_need')}
          value={p.need}
          onChange={(need) => setProfile({ need })}
          options={[
            { value: 'full', label: t('need_full') },
            { value: 'part', label: t('need_part') },
            { value: 'none', label: t('need_none') },
          ]}
        />
        <Choice
          label={t('f_region')}
          value={p.region}
          onChange={(region) => setProfile({ region })}
          options={[
            { value: 'any', label: t('any') },
            ...(['Northeast', 'South', 'Midwest', 'West'] as const).map((r) => ({ value: r, label: r })),
          ]}
        />
      </Section>

      <Card>
        <Text kind="label">{t('language')}</Text>
        <LangPicker />
        <Choice
          label={t('theme')}
          value={state.theme}
          onChange={(theme) => set({ theme })}
          options={[
            { value: 'system', label: t('th_system') },
            { value: 'light', label: t('th_light') },
            { value: 'dark', label: t('th_dark') },
          ]}
        />
        <Button
          kind="outline"
          title={t('sign_out')}
          style={{ alignSelf: 'flex-start' }}
          onPress={async () => {
            await signOut();
            router.replace('/log-in');
          }}
        />
      </Card>
    </Screen>
  );
}
