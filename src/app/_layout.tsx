import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { Archivo_400Regular, Archivo_500Medium, Archivo_600SemiBold, Archivo_700Bold } from '@expo-google-fonts/archivo';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Intro } from '@/components/intro';
import { StoreProvider, useStore } from '@/lib/store';
import { ThemeProvider, useTheme } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Themed />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Themed() {
  const { state, ready } = useStore();
  return (
    <ThemeProvider mode={state.theme}>
      <Root ready={ready} />
    </ThemeProvider>
  );
}

function Root({ ready }: { ready: boolean }) {
  const { c, scheme } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    ArchivoBlack_400Regular,
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    JetBrainsMono_500Medium,
  });
  const loaded = ready && (fontsLoaded || !!fontError);
  // Coaches opening an athlete's profile link go straight to it, without the opening animation.
  const isCoachLink = usePathname().startsWith('/p/');

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {isCoachLink ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
      ) : (
        <Intro>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
        </Intro>
      )}
    </>
  );
}
