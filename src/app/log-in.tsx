import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthShell, Notice, OrDivider } from '@/components/auth-shell';
import { SocialButtons } from '@/components/social';
import { Button, Field, Text } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { Fonts, useTheme } from '@/lib/theme';

export default function LogIn() {
  const { t } = useT();
  const { c } = useTheme();
  const { state, set } = useStore();
  const [email, setEmail] = useState(state.account?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [forgot, setForgot] = useState(false);

  function logIn() {
    if (password.length < 8) return setError(t('need_password'));
    // Accounts live on this device until online accounts are added.
    if (!state.account || state.account.email !== email.trim().toLowerCase()) return setError(t('wrong_login'));
    set({ signedIn: true });
    router.replace('/home');
  }

  return (
    <AuthShell title={t('welcome_back')} lead={t('login_lead')}>
      <SocialButtons />
      <OrDivider />
      <Field
        label={t('f_email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        label={t('f_password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        placeholder={t('f_password')}
        error={error}
        onSubmitEditing={logIn}
      />
      <Pressable onPress={() => setForgot(true)} style={{ alignSelf: 'flex-end' }} accessibilityRole="button">
        <Text kind="small" color={c.accent} style={{ fontFamily: Fonts.semibold }}>{t('forgot')}</Text>
      </Pressable>
      {forgot && <Notice text={t('forgot_soon')} />}
      <Button title={t('log_in')} onPress={logIn} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
        <Text kind="small" muted>{t('new_here')}</Text>
        <Link href="/sign-up" style={{ color: c.accent, fontFamily: Fonts.semibold, fontSize: 13 }}>
          {t('create_an_account')}
        </Link>
      </View>
    </AuthShell>
  );
}
