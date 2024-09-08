// `app/(tabs)/two.tsx`
import { StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useDidOperations } from '@/components/utils/did_operations';
import { generateVC } from "@/components/utils/user_details";
import { useGenerateVC } from "@/components/useGenerateVC";
import { useAuth } from "@/app/(auth)/auth";
import { getDIDForLoggedInUser, getVCForLoggedInUser } from "@/components/utils";
import { createWallet, getWalletsForLoggedInUser } from "@/components/utils/wallet_ops";
import { useEffect, useState } from "react";
import { usePocketBase } from "@/components/Services/Pocketbase";
import React from 'react';

export default function TabTwoScreen() {
  const router = useRouter();
  const { setDHTDid, setJWKDid } = useDidOperations();
  const { handleGenerateVC } = useGenerateVC();
  const { signOut, user } = useAuth();
  const { pb } = usePocketBase();
  const [myDid, setMyDid] = useState("this isnt working currently please wait this isnt working currently please wait");
  const [myVC, setMyVC] = useState("\"this isnt working currently please wait\" \"this isnt working currently please wait\"");
  const [myWallets, setMyWallets] = useState([]);

  useEffect(() => {
    getDIDForLoggedInUser(user, pb).then(r => setMyDid(r.document.id));
    getVCForLoggedInUser(user, pb).then(r => setMyVC(r));
    getWalletsForLoggedInUser(user, pb).then(r => setMyWallets(r));
  }, [user, pb]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Testing </Text>
      <Text style={styles.title}>My DID: </Text>
      <Text>{String(myDid).slice(0, 12)}</Text>
      <Text style={styles.title}>My VC: </Text>
      <Text>{String(myVC).slice(-12, -1)}</Text>
      <Text style={styles.title}>My Wallets: </Text>
      {myWallets.map(wallet => (
        <Text key={wallet.id}>{wallet.address} - {wallet.balance} {wallet.currency}</Text>
      ))}
      <Text onPress={() => { setDHTDid().then(r => console.log(r)) }} style={styles.title}>Test DHT</Text>
      <Text onPress={() => { setJWKDid().then(r => console.log(r)) }} style={styles.title}>Test JWT</Text>
      <Text onPress={() => { handleGenerateVC().then(r => console.log(r)) }} style={styles.title}>Test VC</Text>
      <Text onPress={() => { createWallet(user, pb, 0, user.id, "fiat", "KES").then(r => console.log(r)) }} style={styles.title}>Create Wallet</Text>
      <Text onPress={async () => {
        await signOut();
      }} style={styles.title}>Sign Out</Text>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});