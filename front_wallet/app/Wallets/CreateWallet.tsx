import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Appbar, Button, TextInput } from 'react-native-paper';
import { usePocketBase } from '@/components/Services/Pocketbase';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { useRouter } from "expo-router";

const CreateWalletScreen = () => {
  const { pb } = usePocketBase();
  const [walletName, setWalletName] = useState('');
  const [currency, setCurrency] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const router = useRouter();

  const handleCreateWallet = async () => {
    const newWallet = {
      // name: walletName,
      currency: currency,
      balance: parseFloat(initialBalance),
      user: user.id,
        address:user.id// Assuming the user is logged in and authenticated
    };

    await pb.collection('wallet').create(newWallet);
    router.push('/Wallets'); // Navigate back to the wallets list screen
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create New Wallet" />
      </Appbar.Header>
      <SafeScreen>
        <TextInput
          label="Wallet Name"
          value={walletName}
          onChangeText={text => setWalletName(text)}
          style={styles.input}
        />
        <TextInput
          label="Currency"
          value={currency}
          onChangeText={text => setCurrency(text)}
          style={styles.input}
        />
        <TextInput
          label="Initial Balance"
          value={initialBalance}
          onChangeText={text => setInitialBalance(text)}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button mode="contained" onPress={handleCreateWallet} style={styles.createButton}>
          Create Wallet
        </Button>
      </SafeScreen>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginBottom: 20,
  },
  createButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default CreateWalletScreen;