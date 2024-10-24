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
import {LoadingProvider} from "@/components/utils/LoadingContext";
import {fetchDHT} from "@/components/utils/did_operations";



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
      // Loading Provider
      <LoadingProvider>
        {/*//Backend Provider*/}
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
                {/*<Stack.Screen name="(auth)" options={{ headerShown: false }} />*/}
                <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
                {/*Modal is just a cool template to use-- no practical use lol*/}
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                {/*Actions*/}
                <Stack.Screen name="actions/send_money" options={{  headerShown:false }} />
                <Stack.Screen name="actions/deposit_money" options={{ headerShown:false }} />
                <Stack.Screen name="actions/receive" options={{  headerShown:false }} />
                <Stack.Screen name="actions/pay" options={{  headerShown:false }} />
                <Stack.Screen name="actions/bill_split" options={{  headerShown:false }} />
                <Stack.Screen name="actions/save" options={{ headerShown:false }} />
                <Stack.Screen name="actions/withdraw" options={{  headerShown:false }} />
                <Stack.Screen name="actions/test_screen" options={{ headerShown:false }} />
                {/*  VC*/}
                <Stack.Screen name="Credentials/add_verifiable_credentials" options={{ presentation: 'modal', headerShown:false }} />
                {/*  Profile*/}
                <Stack.Screen name="Profile/Profile" options={{  headerShown:false }} />
                {/*Manage DID*/}
                <Stack.Screen name="DID/manage_did" options={{ headerShown:false }} />
                {/*  Exchange Details*/}
                <Stack.Screen name="exchange-details/[exchangeId]" options={{ headerShown: false }} />
              {/*  Bill Management*/}
                <Stack.Screen name="split_bill/BillCreation" options={{ title: 'Create Bill',headerShown:false }} />
                <Stack.Screen name="split_bill/JoinBill" options={{ title: 'Join Bill',headerShown:false }} />
                <Stack.Screen name="split_bill/ManageBills" options={{ title: 'Manage Bills',headerShown:false }} />
                <Stack.Screen name="split_bill/BillDetails/[bill_id]" options={{ title: 'Manage Bills',headerShown:false }} />
              {/*  Wallet Management*/}
                <Stack.Screen name="Wallets/ManageWallets" options={{ title: 'Manage Wallets',headerShown:false }} />
                <Stack.Screen name="Wallets/CreateWallet" options={{ title: 'Create Wallet',headerShown:false }} />
                <Stack.Screen name="Wallets/[wallet_id]" options={{ title: 'Wallet Details',headerShown:false }} />
              {/*  Settings*/}
                <Stack.Screen name="Settings/Profile" options={{ title: 'Profile',headerShown:false }} />
                <Stack.Screen name="Settings/Security" options={{ title: 'Security',headerShown:false }} />
                <Stack.Screen name="Settings/Password" options={{ title: 'Password',headerShown:false }} />
                <Stack.Screen name="Settings/Support" options={{ title: 'Support',headerShown:false }} />
              {/*  Coin Exchange*/}
                <Stack.Screen name={"actions/coin_exchange"} options={{ headerShown: false }} />
              {/*  PFI details*/}
                <Stack.Screen name="pfi-details/[pfiId]" options={{ headerShown: false ,presentation:"modal"}} />
                {/*PIN auth*/}
                <Stack.Screen name="EnterPIN/EnterPIN" options={{ headerShown:false ,presentation:"modal"}} />
                {/*All PFIS*/}
                <Stack.Screen name="all-pfis/all-pfis" options={{ headerShown: false }} />
              </Stack>
            </PaperProvider>
          </AuthProvider>
        </PocketBaseProvider>
      </LoadingProvider>

  );
}
