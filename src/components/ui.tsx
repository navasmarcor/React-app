import { Children, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, MaxContentWidth, Radius, Space, useTheme } from '@/lib/theme';
import { useLayout } from './use-layout';

type TextKind = 'display' | 'title' | 'h2' | 'label' | 'body' | 'small' | 'mono' | 'bold';

export function Text({
  kind = 'body',
  muted,
  color,
  style,
  children,
  numberOfLines,
  selectable,
}: {
  selectable?: boolean;
  kind?: TextKind;
  muted?: boolean;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  numberOfLines?: number;
}) {
  const { c } = useTheme();
  return (
    <RNText
      selectable={selectable}
      numberOfLines={numberOfLines}
      style={[textStyles[kind], { color: color ?? (muted || kind === 'label' ? c.muted : c.ink) }, style]}>
      {children}
    </RNText>
  );
}

const textStyles = StyleSheet.create({
  display: { fontFamily: Fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.2 },
  title: { fontFamily: Fonts.display, fontSize: 22, lineHeight: 27 },
  h2: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 22 },
  label: { fontFamily: Fonts.semibold, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase' },
  body: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18 },
  mono: { fontFamily: Fonts.mono, fontSize: 15 },
  bold: { fontFamily: Fonts.bold, fontSize: 15, lineHeight: 21 },
});

/** Scrollable page with the content width capped on computers. */
export function Screen({ children, edges = ['top'] }: { children: ReactNode; edges?: ('top' | 'bottom')[] }) {
  const { c } = useTheme();
  const { wide } = useLayout();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: wide ? Space.xxl : Space.lg,
          paddingVertical: wide ? Space.xl + 4 : Space.lg,
          gap: Space.lg,
          width: '100%',
          maxWidth: MaxContentWidth,
          alignSelf: 'center',
        }}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        { backgroundColor: c.surface, borderColor: c.line, borderWidth: 1, borderRadius: Radius.lg, padding: Space.lg, gap: Space.md },
        style,
      ]}>
      {children}
    </View>
  );
}

type ButtonKind = 'primary' | 'outline' | 'black' | 'ghost';

export function Button({
  title,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  style,
  small,
}: {
  title: string;
  onPress?: () => void;
  kind?: ButtonKind;
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const { c } = useTheme();
  const bg = { primary: c.accent, outline: c.surface, black: c.black, ghost: 'transparent' }[kind];
  const fg = { primary: c.onAccent, outline: c.ink, black: c.onBlack, ghost: c.muted }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderColor: kind === 'outline' ? c.line : bg,
          borderWidth: 1,
          borderRadius: Radius.md,
          paddingVertical: small ? 8 : 12,
          paddingHorizontal: small ? 12 : 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}>
      {icon}
      <RNText style={{ color: fg, fontFamily: Fonts.bold, fontSize: small ? 13.5 : 15 }}>{title}</RNText>
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  error,
  style,
  mono,
  ...input
}: TextInputProps & { label: string; hint?: string; error?: string; mono?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ gap: 5, minWidth: 0 }, style]}>
      <Text kind="label">{label}</Text>
      <TextInput
        placeholderTextColor={c.placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        accessibilityLabel={label}
        {...input}
        style={{
          backgroundColor: c.surface,
          borderColor: error ? c.red : focus ? c.accent : c.line,
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 11,
          fontSize: 15,
          fontFamily: mono ? Fonts.mono : Fonts.body,
          color: c.ink,
        }}
      />
      {error ? <Text kind="small" color={c.red}>{error}</Text> : hint ? <Text kind="small" muted>{hint}</Text> : null}
    </View>
  );
}

/** A row of options where exactly one is chosen. */
export function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
  style,
}: {
  label?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View style={[{ gap: 5, minWidth: 0 }, style]}>
      {label ? <Text kind="label">{label}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }} accessibilityRole="radiogroup">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onChange(o.value)}
              style={{
                borderRadius: Radius.pill,
                borderWidth: 1,
                borderColor: on ? c.accent : c.line,
                backgroundColor: on ? c.accent : c.surface,
                paddingHorizontal: 12,
                paddingVertical: 7,
              }}>
              <RNText style={{ fontFamily: Fonts.semibold, fontSize: 13, color: on ? c.onAccent : c.ink }}>{o.label}</RNText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Badge({ tone, children }: { tone: 'good' | 'muted' | 'accent' | 'warn'; children: ReactNode }) {
  const { c } = useTheme();
  const map = {
    good: [c.goodSoft, c.good],
    muted: [c.chip2, c.muted],
    accent: [c.accentSoft, c.accent],
    warn: [c.warnSoft, c.warn],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: bg, borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 2 }}>
      <RNText style={{ color: fg, fontFamily: Fonts.bold, fontSize: 11 }}>{children}</RNText>
    </View>
  );
}

export function Row({ children, style, gap = Space.md }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap, alignItems: 'flex-start' }, style]}>{children}</View>;
}

/** Lays out form fields side by side on wide screens and stacks them on phones. */
export function FieldRow({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Space.md }}>
      {items.map((child, i) => (
        <View key={i} style={{ flexGrow: 1, flexBasis: 220, minWidth: 0 }}>
          {child}
        </View>
      ))}
    </View>
  );
}

export function Avatar({ name, size = 40, uri }: { name: string; size?: number; uri?: string }) {
  const { c } = useTheme();
  const initials =
    name
      .split(/\s+/)
      .map((w) => w[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
      <RNText style={{ color: '#ffffff', fontFamily: Fonts.bold, fontSize: size * 0.34 }}>{initials}</RNText>
    </View>
  );
}

export function Divider() {
  const { c } = useTheme();
  return <View style={{ height: 1, backgroundColor: c.line }} />;
}
