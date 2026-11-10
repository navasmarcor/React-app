import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { Avatar, Badge, Button, Card, Row, Text } from '@/components/ui';
import { useLayout } from '@/components/use-layout';
import { useT } from '@/lib/i18n';
import { formatMark, gpa4, parseMark } from '@/lib/schools';
import { slugFor, useStore } from '@/lib/store';
import { Fonts, Radius, Space, useTheme } from '@/lib/theme';

/**
 * The page a coach opens from the email link. For now it shows the profile saved on this device;
 * once online accounts exist it will load any athlete by their link.
 */
export default function CoachProfile() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { state } = useStore();
  const { t, ev } = useT();
  const { c } = useTheme();
  const { wide } = useLayout();
  const p = state.profile;
  const found = p.name && slugFor(p.name) === slug;

  if (!found) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
        <Text kind="title">{t('not_found')}</Text>
        <Text muted style={{ textAlign: 'center', maxWidth: 360 }}>{t('not_found_body')}</Text>
        {router.canGoBack() && <Button kind="outline" title={t('back')} onPress={() => router.back()} />}
      </SafeAreaView>
    );
  }

  const bests = p.pbs.filter((pb) => !isNaN(parseMark(pb.ev, pb.mark)));
  const videos = p.videos.filter((v) => v.trim());
  const photos = [...p.photos.track, ...p.photos.life];
  const g = gpa4(p);
  const firstName = p.name.split(' ')[0];
  const emailCoach = () => Linking.openURL(`mailto:${p.email}`);

  const marks = (
    <Card>
      <Text kind="label">{t('c_bests')}</Text>
      <Row gap={10}>
        {bests.map((pb, i) => (
          <View
            key={i}
            style={{
              flexGrow: 1,
              flexBasis: 150,
              borderWidth: i === 0 ? 2 : 1,
              borderColor: i === 0 ? c.accent : c.line,
              borderRadius: 12,
              padding: 12,
              gap: 4,
            }}>
            <Text kind="small" muted style={{ fontFamily: Fonts.semibold }}>{ev(pb.ev)}</Text>
            <Text kind="mono" style={{ fontSize: wide ? 28 : 22 }}>{formatMark(pb.ev, parseMark(pb.ev, pb.mark))}</Text>
            <Badge tone="muted">{t('self_reported')}</Badge>
            {pb.meet ? <Text kind="small" muted>{pb.meet}</Text> : null}
          </View>
        ))}
      </Row>
    </Card>
  );

  const video = videos.length ? (
    <Pressable
      accessibilityRole="link"
      onPress={() => Linking.openURL(videos[0])}
      style={{ borderRadius: Radius.lg, backgroundColor: '#1b2a44', minHeight: wide ? 220 : 90, padding: 18, justifyContent: wide ? 'flex-end' : 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: wide ? 54 : 38, height: wide ? 54 : 38, borderRadius: 30, backgroundColor: c.red, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="play" size={wide ? 22 : 15} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <RNText style={{ color: '#ffffff', fontFamily: Fonts.bold, fontSize: 15 }}>{t('c_video_btn')}</RNText>
          {bests[0]?.meet ? <RNText style={{ color: '#b8c3d6', fontFamily: Fonts.body, fontSize: 12.5 }}>{bests[0].meet}</RNText> : null}
        </View>
      </View>
    </Pressable>
  ) : null;

  const fact = (label: string, value: string, badge?: boolean) => (
    <View key={label} style={{ flexGrow: 1, flexBasis: 110, gap: 3 }}>
      <Text kind="label" style={{ fontSize: 10.5 }}>{label}</Text>
      <Text kind="bold" style={{ fontSize: 16 }}>{value}</Text>
      {badge && <Badge tone="muted">{t('self_reported')}</Badge>}
    </View>
  );

  const academics = (
    <Card>
      <Text kind="label">{t('c_acad')}</Text>
      <Row gap={12}>
        {g > 0 && fact('GPA', `${g.toFixed(2)} / 4.0`, true)}
        {fact(t('f_english'), `${p.english}`, true)}
        {Number(p.sat) > 0 && fact(t('c_sat'), p.sat, true)}
        {p.grad ? fact(t('c_grad'), p.grad) : null}
      </Row>
    </Card>
  );

  const gallery = photos.length ? (
    <Card>
      <Text kind="label">{t('c_photos')}</Text>
      <Row gap={7}>
        {photos.map((uri, i) => (
          <Image key={uri + i} source={{ uri }} style={{ width: wide ? 104 : 92, height: wide ? 104 : 92, borderRadius: 9 }} contentFit="cover" />
        ))}
      </Row>
    </Card>
  ) : null;

  const contact = (
    <Card>
      <Text kind="label">{t('c_contact')}</Text>
      <Text selectable>{p.email}</Text>
      <Button title={t('email_athlete', { name: firstName })} onPress={emailCoach} />
    </Card>
  );

  const col = (children: ReactNode) => <View style={{ flex: 1, gap: Space.lg, minWidth: 0 }}>{children}</View>;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView>
        <View style={{ backgroundColor: c.navy, borderBottomWidth: 4, borderBottomColor: c.red }}>
          <SafeAreaView edges={['top']}>
            <View style={{ width: '100%', maxWidth: 980, alignSelf: 'center', padding: wide ? 30 : 18, flexDirection: 'row', alignItems: 'center', gap: wide ? 22 : 14 }}>
              <Avatar name={p.name} size={wide ? 84 : 52} uri={p.photos.track[0]} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <RNText style={{ fontFamily: Fonts.display, fontSize: wide ? 34 : 21, color: c.onNavy, textTransform: 'uppercase' }}>{p.name}</RNText>
                <RNText style={{ fontFamily: Fonts.body, fontSize: wide ? 15 : 12.5, color: c.onNavyMuted }}>
                  {[bests.map((b) => ev(b.ev)).join(' · '), p.grad ? `${t('class_of')} ${p.grad}` : ''].filter(Boolean).join(' · ')}
                </RNText>
                <RNText style={{ fontFamily: Fonts.body, fontSize: wide ? 15 : 12.5, color: c.onNavyMuted }}>
                  {[p.school, p.country].filter(Boolean).join(', ')}
                </RNText>
              </View>
              {wide && <Button title={t('email_athlete', { name: firstName })} onPress={emailCoach} />}
            </View>
          </SafeAreaView>
        </View>

        {state.signedIn && (
          <View style={{ backgroundColor: c.accentSoft, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <Text kind="small" color={c.accent} style={{ fontFamily: Fonts.semibold }}>{t('c_preview')}</Text>
            {router.canGoBack() && <Button small kind="outline" title={t('back')} onPress={() => router.back()} />}
          </View>
        )}

        <View style={{ width: '100%', maxWidth: 980, alignSelf: 'center', padding: wide ? 30 : 16, gap: Space.lg, flexDirection: wide ? 'row' : 'column' }}>
          {wide ? (
            <>
              {col(
                <>
                  {marks}
                  {video}
                  {academics}
                </>,
              )}
              {col(
                <>
                  {gallery}
                  {contact}
                </>,
              )}
            </>
          ) : (
            <>
              {marks}
              {video}
              {academics}
              {gallery}
              {contact}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
