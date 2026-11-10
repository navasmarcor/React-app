import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthShell, Notice, OrDivider } from '@/components/auth-shell';
import { SocialButtons } from '@/components/social';
import { Button, Field, Text } from '@/components/ui';
import { SITE_URL } from '@/lib/config';
import { useT } from '@/lib/i18n';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Fonts, useTheme } from '@/lib/theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LogIn() {
  const { t } = useT();
  const { c } = useTheme();
  const { state, set } = useStore();
  const [email, setEmail] = useState(state.demo ? '' : (state.account?.email ?? ''));
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function logIn() {
    setNotice(undefined);
    if (!EMAIL.test(email.trim())) return setError(t('need_email'));
    if (password.length < 8) return setError(t('need_password'));
    setError(undefined);
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (err) {
      const code = (err as { code?: string }).code;
      if (code === 'email_not_confirmed') return setError(t('confirm_first'));
      if (code === 'invalid_credentials') return setError(t('wrong_login'));
      return setError(err.message || t('net_error'));
    }
    set({ signedIn: true, demo: false });
    router.replace('/home');
  }

  async function forgot() {
    setError(undefined);
    if (!EMAIL.test(email.trim())) return setNotice(t('forgot_soon'));
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${SITE_URL}/new-password`,
    });
    setNotice(err ? err.message || t('net_error') : t('reset_sent'));
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
      <Pressable onPress={forgot} style={{ alignSelf: 'flex-end' }} accessibilityRole="button">
        <Text kind="small" color={c.accent} style={{ fontFamily: Fonts.semibold }}>{t('forgot')}</Text>
      </Pressable>
      {notice && <Notice text={notice} />}
      <Button title={busy ? t('loading') : t('log_in')} disabled={busy} onPress={logIn} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
        <Text kind="small" muted>{t('new_here')}</Text>
        <Link href="/sign-up" style={{ color: c.accent, fontFamily: Fonts.semibold, fontSize: 13 }}>
          {t('create_an_account')}
        </Link>
      </View>
    </AuthShell>
  );
}
