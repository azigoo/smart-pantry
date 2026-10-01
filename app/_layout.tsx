import { AuthProvider } from '@/context/AuthContext';
import { DespensaProvider } from '@/context/DespensaContext';
import { colors } from '@/theme/colors';
import { Baloo2_600SemiBold, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Baloo2_700Bold,
    Baloo2_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <AuthProvider>
      <DespensaProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="producto/nuevo"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
        </SafeAreaProvider>
      </DespensaProvider>
    </AuthProvider>
  );
}