import { View } from 'react-native';

import { Card, Screen, Text } from '@/components/ui';
import { useT, type StringKey } from '@/lib/i18n';
import { adviceTips, profileChecks, type Tip } from '@/lib/schools';
import { useStore } from '@/lib/store';
import { Fonts, useTheme } from '@/lib/theme';

const CHECK_TEXT: Record<string, [StringKey, StringKey]> = {
  video: ['a_video', 'a_video_p'],
  old: ['a_old', 'a_old_p'],
  sat: ['a_sat', 'a_sat_p'],
  english: ['a_eng', 'a_eng_p'],
  photos: ['a_photos', 'a_photos_p'],
};

export default function Advice() {
  const { state } = useStore();
  const { t, ev } = useT();
  const { c } = useTheme();
  const tips = adviceTips(state.profile);
  const checks = profileChecks(state.profile, tips);
  const names = (arr: string[]) => arr.slice(0, 3).join(', ') + (arr.length > 3 ? ` +${arr.length - 3}` : '');

  const text = (tip: Tip): [string, string] => {
    if (tip.kind === 'mark') {
      const timed = !tip.target.endsWith(' m');
      return [t(timed ? 'a_time' : 'a_dist', { ev: ev(tip.ev), tgt: tip.target }), t('a_time_p', { list: names(tip.schools) })];
    }
    if (tip.kind === 'gpa') return [t('a_gpa', { tgt: tip.target }), t('a_gpa_p', { list: names(tip.schools) })];
    return [t('a_sat'), t('a_sat_p')];
  };

  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Text kind="display">{t('a_title')}</Text>
        <Text muted>{t('a_lead')}</Text>
      </View>

      {tips.length === 0 ? (
        <Card>
          <Text>{t('nothing')}</Text>
        </Card>
      ) : (
        tips.map((tip, i) => {
          const [title, body] = text(tip);
          return (
            <Card key={i} style={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text kind="h2">{title}</Text>
                <Text kind="small" muted style={{ fontSize: 14 }}>{body}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text kind="title" color={c.good}>{`+${tip.n}`}</Text>
                <Text kind="label" style={{ fontSize: 10 }}>{t('unlock')}</Text>
              </View>
            </Card>
          );
        })
      )}

      {checks.length > 0 && (
        <View style={{ gap: 10 }}>
          <Text kind="label" style={{ marginTop: 6 }}>{t('quality')}</Text>
          {checks.map((k) => (
            <Card key={k} style={{ gap: 4 }}>
              <Text kind="h2">{t(CHECK_TEXT[k][0])}</Text>
              <Text kind="small" muted style={{ fontSize: 14, fontFamily: Fonts.body }}>{t(CHECK_TEXT[k][1])}</Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
