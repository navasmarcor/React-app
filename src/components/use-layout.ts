import { useWindowDimensions } from 'react-native';

import { WideBreakpoint } from '@/lib/theme';

/** "wide" is the computer layout: side menu and multi-column screens. */
export function useLayout() {
  const { width } = useWindowDimensions();
  return { width, wide: width >= WideBreakpoint };
}
