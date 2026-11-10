import { Link, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthShell, Notice, OrDivider } from '@/components/auth-shell';
import { SocialButtons } from '@/components/social';
import { Button, Choice, Field, Text } from '@/components/ui';
import { SITE_URL } from '@/lib/config';
import { useT } from '@/lib/i18n';
import { emptyProfile, exampleProfile, useStore, type Account } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Fonts, useTheme } from '@/lib/theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const { t } = useT();
  const { c } = useTheme();
  const { set } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Account['role']>('athlete');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();

  async function create() {
    const e = {
      name: name.trim() ? undefined : t('need_name'),
      email: EMAIL.test(email.trim()) ? undefined : t('need_email'),
      password: password.length >= 8 ? undefined : t('need_password'),
    };
    setErrors(e);
    setNotice(undefined);
    if (e.name || e.email || e.password) return;
    const account: Account = { name: name.trim(), email: email.trim().toLowerCase(), role };
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: account.email,
      password,
      options: { data: { name: account.name, role }, emailRedirectTo: SITE_URL },
    });
    setBusy(false);
    if (error) return setNotice(error.message || t('net_error'));
    // Start this account with a fresh profile; the store loads anything already saved online.
    set({
      account,
      signedIn: !!data.session,
      demo: false,
      userId: null,
      slug: null,
      profile: emptyProfile(role === 'athlete' ? account.name : '', account.email),
      custom: [],
      outreach: {},
    });
    if (data.session) router.replace('/home');
    else setNotice(t('check_email'));
  }

  function tryExample() {
    set({
      account: { name: exampleProfile.name, email: exampleProfile.email, role: 'athlete' },
      signedIn: true,
      demo: true,
      userId: null,
      slug: null,
      profile: exampleProfile,
      custom: [],
      outreach: {},
    });
    router.replace('/home');
  }

  return (
    <AuthShell title="React App" lead={t('tagline')}>
      <Field label={t('f_fullname')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" error={errors.name} />
      <Field
        label={t('f_email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errors.email}
      />
      <Field
        label={t('f_password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={errors.password}
        onSubmitEditing={create}
      />
      <Choice
        label={t('i_am')}
        value={role}
        onChange={setRole}
        options={[
          { value: 'athlete', label: t('athlete') },
          { value: 'parent', label: t('parent') },
        ]}
      />
      {notice && <Notice text={notice} />}
      <Button title={busy ? t('loading') : t('create_account')} disabled={busy} onPress={create} style={{ marginTop: 4 }} />
      <OrDivider />
      <SocialButtons />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
        <Text kind="small" muted>{t('have_account')}</Text>
        <Link href="/log-in" style={{ color: c.accent, fontFamily: Fonts.semibold, fontSize: 13 }}>
          {t('log_in')}
        </Link>
      </View>
      <Button kind="ghost" small title={t('try_example')} onPress={tryExample} />
    </AuthShell>
  );
}
