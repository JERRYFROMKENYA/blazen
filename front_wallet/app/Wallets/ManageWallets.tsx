import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text, Card, Appbar, Button } from 'react-native-paper';
import { useAuth } from '@/app/(auth)/auth';
import { usePocketBase } from '@/components/Services/Pocketbase';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { View } from "@/components/Themed";
import { getWalletsForLoggedInUser } from "@/components/utils/wallet_ops";
import { useRouter } from "expo-router";
import {formatNumberWithCommas} from "@/components/utils/format";

const ManageWalletsScreen = () => {
  const { user } = useAuth();
  const { pb } = usePocketBase();
  const [wallets, setWallets] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchWallets = async () => {
      setWallets(await getWalletsForLoggedInUser(user, pb));
    };

    fetchWallets().then(() => {
      console.log(wallets);
    });
  }, [user, pb, router]);

  const handleCreateWallet = () => {
    router.push('/Wallets/CreateWallet');
  };

  const handleManageWallet = (walletId) => {
    router.push(`/Wallets/${walletId}`);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Manage Wallets" />
      </Appbar.Header>
      <SafeScreen>
        {wallets && (
          <FlatList
              style={
              {
                    width: '100%',
                    padding: 10,
              }
              }
            data={wallets}
            renderItem={({ item }) => (
              <Card style={styles.walletCard}>
                <Card.Content>
                  <View style={styles.walletItem}>
                    <Text style={styles.walletText}>{item.currency} {formatNumberWithCommas(item.balance)}</Text>
                    <Button mode="outlined" onPress={() => handleManageWallet(item.id)} style={styles.manageButton}>
                      Manage
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            )}
            keyExtractor={item => item.id.toString()}
          />
        )}
        <Button mode="contained" onPress={handleCreateWallet} style={styles.createButton}>
          Create New Wallet
        </Button>
      </SafeScreen>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  walletCard: {
    marginBottom: 10,
    borderRadius: 10,
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  walletText: {
    fontSize: 16,
  },
  manageButton: {
    marginLeft: 10,
  },
  createButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default ManageWalletsScreen;