import { router } from 'expo-router';
import { useState } from 'react';

import { AuthShell, Notice } from '@/components/auth-shell';
import { Button, Field } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

/** Opened from the password reset email. */
export default function NewPassword() {
  const { t } = useT();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  async function save() {
    if (password.length < 8) return setError(t('need_password'));
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) return setError(err.message || t('net_error'));
    setDone(true);
    setTimeout(() => router.replace('/home'), 1200);
  }

  return (
    <AuthShell title={t('new_password')} lead={t('login_lead')}>
      <Field
        label={t('f_password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={error}
        onSubmitEditing={save}
      />
      {done && <Notice text={t('password_saved')} />}
      <Button title={t('save_password')} onPress={save} />
    </AuthShell>
  );
}
