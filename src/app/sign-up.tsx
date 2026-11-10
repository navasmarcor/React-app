import { Link, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthShell, OrDivider } from '@/components/auth-shell';
import { SocialButtons } from '@/components/social';
import { Button, Choice, Field, Text } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { emptyProfile, exampleProfile, useStore, type Account } from '@/lib/store';
import { Fonts, useTheme } from '@/lib/theme';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const { t } = useT();
  const { c } = useTheme();
  const { state, set } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Account['role']>('athlete');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  function create() {
    const e = {
      name: name.trim() ? undefined : t('need_name'),
      email: EMAIL.test(email.trim()) ? undefined : t('need_email'),
      password: password.length >= 8 ? undefined : t('need_password'),
    };
    setErrors(e);
    if (e.name || e.email || e.password) return;
    const account = { name: name.trim(), email: email.trim().toLowerCase(), role };
    const keep = state.account?.email === account.email;
    set({
      account,
      signedIn: true,
      profile: keep ? state.profile : emptyProfile(role === 'athlete' ? account.name : '', account.email),
      ...(keep ? {} : { custom: [], outreach: {} }),
    });
    router.replace('/home');
  }

  function tryExample() {
    set({
      account: { name: exampleProfile.name, email: exampleProfile.email, role: 'athlete' },
      signedIn: true,
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
      <Button title={t('create_account')} onPress={create} style={{ marginTop: 4 }} />
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
