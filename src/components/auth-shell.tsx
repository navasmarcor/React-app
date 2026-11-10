import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LANGS, useT } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { Fonts, Radius, Space, useTheme } from '@/lib/theme';
import { Logo } from './logo';
import { Text } from './ui';
import { useLayout } from './use-layout';

export function LangPicker({ onDark }: { onDark?: boolean }) {
  const { state, set } = useStore();
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="radiogroup">
      {LANGS.map((l) => {
        const on = state.lang === l;
        return (
          <Pressable
            key={l}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => set({ lang: l })}
            style={{
              borderRadius: Radius.pill,
              borderWidth: 1,
              borderColor: on ? c.accent : onDark ? '#3a4a66' : c.line,
              backgroundColor: on ? c.accent : onDark ? 'transparent' : c.surface,
              paddingHorizontal: 11,
              paddingVertical: 4,
            }}>
            <RNText style={{ fontFamily: Fonts.semibold, fontSize: 12, color: on ? c.onAccent : onDark ? c.onNavy : c.ink }}>
              {l.toUpperCase()}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Sign up and log in: one column on phones, brand panel plus form on computers. */
export function AuthShell({ children, title, lead }: { children: ReactNode; title: string; lead: string }) {
  const { c } = useTheme();
  const { wide } = useLayout();
  const { t } = useT();

  const form = (
    <View style={{ gap: Space.md, width: '100%', maxWidth: 420, alignSelf: 'center' }}>
      {!wide && (
        <View style={{ alignItems: 'center', gap: Space.sm, marginBottom: Space.sm }}>
          <Logo size={60} />
          <Text kind="title">{title}</Text>
          <Text kind="small" muted style={{ textAlign: 'center' }}>{lead}</Text>
          <View style={{ marginTop: 4 }}>
            <LangPicker />
          </View>
        </View>
      )}
      {wide && (
        <View style={{ gap: 4, marginBottom: Space.sm }}>
          <Text kind="display">{title}</Text>
          <Text muted>{lead}</Text>
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={wide ? [] : ['top', 'bottom']} style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {wide && (
            <View
              style={{
                flex: 1,
                backgroundColor: c.navy,
                padding: 48,
                justifyContent: 'space-between',
                borderRightWidth: 4,
                borderRightColor: c.red,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Logo size={44} />
                <RNText style={{ fontFamily: Fonts.display, fontSize: 20, color: c.onNavy }}>
                  React <RNText style={{ color: c.red }}>App</RNText>
                </RNText>
              </View>
              <View style={{ gap: 14, maxWidth: 420 }}>
                <RNText style={{ fontFamily: Fonts.display, fontSize: 38, lineHeight: 42, color: c.onNavy }}>{t('side_title')}</RNText>
                <RNText style={{ fontFamily: Fonts.body, fontSize: 16, lineHeight: 23, color: c.onNavyMuted }}>{t('side_body')}</RNText>
              </View>
              <LangPicker onDark />
            </View>
          )}
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: wide ? 60 : Space.xl - 4 }}>
            {form}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function OrDivider() {
  const { c } = useTheme();
  const { t } = useT();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
      <Text kind="small" muted>{t('or')}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
    </View>
  );
}

export function Notice({ text }: { text: string }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.warnSoft, borderRadius: 10, padding: 10 }}>
      <Text kind="small" color={c.warn}>{text}</Text>
    </View>
  );
}
