import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { PaperProvider } from 'react-native-paper';
import React from 'react';

import { PocketBaseProvider } from '@/components/Services/Pocketbase';
import { AuthProvider } from '@/app/(auth)/auth';



export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RootLayoutNav />
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
      //Backend Provider
      <PocketBaseProvider>
        {/*Authentication Provider*/}
        <AuthProvider>
          {/*UI Library Provider*/}
          <PaperProvider>
            {/*Stack Provider*/}
            <Stack>
              {/*Main App Stack*/}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              {/*Auth Stack*/}
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              {/*Modal is just a cool template to use-- no practical use lol*/}
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              {/*Actions*/}
              <Stack.Screen name="actions/send_money" options={{ presentation: 'modal', headerShown:false }} />
              <Stack.Screen name="actions/deposit_money" options={{ presentation: 'modal', headerShown:false }} />
              <Stack.Screen name="actions/receive" options={{ presentation: 'modal', headerShown:false }} />
              <Stack.Screen name="actions/pay" options={{ presentation: 'modal', headerShown:false }} />
              <Stack.Screen name="actions/bill_split" options={{ presentation: 'modal', headerShown:false }} />
              <Stack.Screen name="actions/save" options={{ presentation: 'modal', headerShown:false }} />
              <Stack.Screen name="actions/withdraw" options={{ presentation: 'modal', headerShown:false }} />
            </Stack>
          </PaperProvider>
        </AuthProvider>
      </PocketBaseProvider>
  );
}
