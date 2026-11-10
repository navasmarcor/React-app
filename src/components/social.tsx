import { useState } from 'react';
import Svg, { Path } from 'react-native-svg';

import { useT } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Notice } from './auth-shell';
import { Button } from './ui';

function AppleMark({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M16.4 12.6c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.3-.1 1.7-.8 3.2-.8s1.9.8 3.3.8c1.3 0 2.2-1.2 3-2.5.9-1.4 1.3-2.7 1.4-2.8-.1 0-2.5-1-2.5-4.2zM14 5.2c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.3z"
      />
    </Svg>
  );
}

function GoogleMark() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.4-.2-2H12v3.9h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-7.9z" />
      <Path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8C4 20.5 7.7 23 12 23z" />
      <Path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.2C1.4 8.6 1 10.2 1 12s.4 3.4 1.2 4.9l3.6-2.8z" />
      <Path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1C17.5 2.1 15 1 12 1 7.7 1 4 3.5 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </Svg>
  );
}

/**
 * Apple's rules require Sign in with Apple whenever another social sign-in is offered,
 * so both buttons ship together. They connect once online accounts exist.
 */
export function SocialButtons() {
  const { t } = useT();
  const { c } = useTheme();
  const [note, setNote] = useState(false);
  return (
    <>
      <Button kind="black" title={t('continue_apple')} icon={<AppleMark color={c.onBlack} />} onPress={() => setNote(true)} />
      <Button kind="outline" title={t('continue_google')} icon={<GoogleMark />} onPress={() => setNote(true)} />
      {note && <Notice text={t('social_soon')} />}
    </>
  );
}
