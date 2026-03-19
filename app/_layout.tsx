import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Aptos': require('../assets/Atpos Font/Aptos.ttf'),
    'Aptos-Bold': require('../assets/Atpos Font/Aptos-Bold.ttf'),
    'Aptos-SemiBold': require('../assets/Atpos Font/Aptos-SemiBold.ttf'),
    'Aptos-Light': require('../assets/Atpos Font/Aptos-Light.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
