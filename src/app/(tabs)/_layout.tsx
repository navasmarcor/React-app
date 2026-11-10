import { Redirect, router, Slot, usePathname } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icons';
import { Logo } from '@/components/logo';
import { Avatar, Text } from '@/components/ui';
import { useLayout } from '@/components/use-layout';
import { useT, type StringKey } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { Fonts, useTheme } from '@/lib/theme';

const TABS: { href: '/home' | '/profile' | '/schools' | '/advice' | '/email'; icon: IconName; label: StringKey }[] = [
  { href: '/home', icon: 'home', label: 'nav_home' },
  { href: '/profile', icon: 'profile', label: 'nav_profile' },
  { href: '/schools', icon: 'schools', label: 'nav_schools' },
  { href: '/advice', icon: 'advice', label: 'nav_advice' },
  { href: '/email', icon: 'email', label: 'nav_email' },
];

/** Bottom tab bar on phones, side menu on computers. */
export default function TabsLayout() {
  const { state } = useStore();
  const { wide } = useLayout();
  const { c } = useTheme();
  const { t } = useT();
  const path = usePathname();

  if (!state.signedIn) return <Redirect href={state.account ? '/log-in' : '/sign-up'} />;

  if (wide) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.bg }}>
        <View style={{ width: 220, backgroundColor: c.surface, borderRightWidth: 1, borderRightColor: c.line, paddingVertical: 22, paddingHorizontal: 14, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingBottom: 18 }}>
            <Logo size={32} />
            <RNText style={{ fontFamily: Fonts.display, fontSize: 17, color: c.ink }}>
              React <RNText style={{ color: c.red }}>App</RNText>
            </RNText>
          </View>
          {TABS.map((tab) => {
            const on = path.startsWith(tab.href);
            return (
              <Pressable
                key={tab.href}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => router.navigate(tab.href)}
                style={(st) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 11,
                  paddingVertical: 9,
                  paddingHorizontal: 10,
                  borderRadius: 9,
                  backgroundColor: on ? c.accentSoft : (st as { hovered?: boolean }).hovered ? c.chip2 : 'transparent',
                })}>
                <Icon name={tab.icon} size={18} color={on ? c.accent : c.muted} />
                <RNText style={{ fontFamily: Fonts.semibold, fontSize: 14, color: on ? c.accent : c.muted }}>{t(tab.label)}</RNText>
              </Pressable>
            );
          })}
          <View style={{ marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderTopWidth: 1, borderTopColor: c.line }}>
            <Avatar name={state.profile.name || state.account?.name || ''} size={34} uri={state.profile.photos.track[0]} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text kind="bold" numberOfLines={1} style={{ fontSize: 13 }}>
                {state.profile.name || state.account?.name}
              </Text>
              <Text kind="small" muted numberOfLines={1}>
                {state.profile.pbs.map((p) => p.ev).join(' · ')}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line }}>
        <View style={{ flexDirection: 'row', paddingTop: 7, paddingBottom: 6 }} accessibilityRole="tablist">
          {TABS.map((tab) => {
            const on = path.startsWith(tab.href);
            return (
              <Pressable
                key={tab.href}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t(tab.label)}
                onPress={() => router.navigate(tab.href)}
                style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                <Icon name={tab.icon} size={21} color={on ? c.accent : c.muted} />
                <RNText style={{ fontFamily: Fonts.semibold, fontSize: 10.5, color: on ? c.accent : c.muted }}>{t(tab.label)}</RNText>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}
