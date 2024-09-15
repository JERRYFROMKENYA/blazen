import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text, Card, Appbar, Button, Portal, Provider, TextInput } from 'react-native-paper';
import { useAuth } from '@/app/(auth)/auth';
import { usePocketBase } from '@/components/Services/Pocketbase';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { useRouter, useLocalSearchParams } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { formatNumberWithCommas } from "@/components/utils/format";
import { View, Modal } from "@/components/Themed";

const WalletDetailsScreen = () => {
  const { user } = useAuth();
  const { pb } = usePocketBase();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [depositVisible, setDepositVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const router = useRouter();
  const { wallet_id } = useLocalSearchParams();
  const toSentenceCase = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchWalletDetails = async () => {
      const record = await pb.collection('wallet').getFirstListItem(`id="${wallet_id}"`, {
        expand: 'user',
      });
      setWallet(record);
    };

    const fetchTransactions = async () => {
      const records = await pb.collection('transaction').getFullList({
        filter: `wallet="${wallet_id}"`,
      });
      setTransactions(records);
    };

    fetchWalletDetails();
    fetchTransactions();
  }, [wallet_id, pb]);

  const handleDeposit = async () => {
    const newBalance = parseFloat(wallet.balance) + parseFloat(depositAmount);
    await pb.collection('wallet').update(wallet.id, { balance: newBalance });
    setWallet({ ...wallet, balance: newBalance });
    setDepositVisible(false);
  };

  const handleWithdraw = async () => {
    const newBalance = parseFloat(wallet.balance) - parseFloat(withdrawAmount);
    await pb.collection('wallet').update(wallet.id, { balance: newBalance });
    setWallet({ ...wallet, balance: newBalance });
    setWithdrawVisible(false);
  };

  if (!wallet) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Provider>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Wallet Details" />
        </Appbar.Header>
        <SafeScreen>
          <Card style={styles.walletCard}>
            <Card.Content>
              <View style={{ alignSelf: "center", padding: 10, width: "10", backgroundColor: "white", margin: 10 }}>
                <QRCode value={`${wallet.provider}.${wallet.id}.${wallet.address}.${wallet.currency}`} size={200} />
                <Text style={{color:"black"}} variant="bodySmall">Scan to Receive Money from Friends</Text>
              </View>
              <Text style={styles.walletText}>Balance: {wallet.currency} {formatNumberWithCommas(wallet.balance)}</Text>
              <Text style={styles.walletText}>Created On: {new Date(wallet.created).toLocaleDateString()}</Text>
              <Text style={styles.walletText}>Wallet Address: {wallet.id + "." + wallet.address + "." + wallet.currency}</Text>
            </Card.Content>
          </Card>
          <Button mode="contained" onPress={() => setDepositVisible(true)} style={styles.depositButton}>
            Mock Deposit
          </Button>
          <Button mode="contained" onPress={() => setWithdrawVisible(true)} style={styles.withdrawButton}>
            Mock Withdraw
          </Button>
          <Text variant="titleLarge">Transactions</Text>
          <FlatList
              style={{marginBottom:300}}
            data={transactions}
            renderItem={({ item }) => (
              <Card style={styles.transactionCard} onPress={()=>{router.push('/exchange-details/'+item.ref)}}>
                <Card.Content>
                  <Text style={styles.transactionText}>Reference: {item.ref}</Text>
                  <Text style={styles.transactionText}>Fees Charged: {item.fees_charged.currency} {Math.round(item.fees_charged.amount)}</Text>
                  {/*<Text style={styles.transactionText}>Type: {item.type}</Text>*/}
                  <Text style={styles.transactionText}>Date: {new Date(item.created).toLocaleString()}</Text>
                  <Text style={styles.transactionText}>Status: {toSentenceCase(item.status)}</Text>
                  <Text variant={"bodySmall"}>Tap to View</Text>
                </Card.Content>
              </Card>
            )}
            keyExtractor={item => item.id.toString()}
          />
        </SafeScreen>
        <Portal>
          <Modal visible={depositVisible} onDismiss={() => setDepositVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalText}>This is a mock deposit. Enter the amount to deposit:</Text>
            <TextInput
              label="Deposit Amount"
              value={depositAmount}
              onChangeText={text => setDepositAmount(text)}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleDeposit} style={styles.confirmButton}>
              Confirm Deposit
            </Button>
          </Modal>
          <Modal visible={withdrawVisible} onDismiss={() => setWithdrawVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalText}>This is a mock withdraw. Enter the amount to withdraw:</Text>
            <TextInput
              label="Withdraw Amount"
              value={withdrawAmount}
              onChangeText={text => setWithdrawAmount(text)}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleWithdraw} style={styles.confirmButton}>
              Confirm Withdraw
            </Button>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom:3
  },
  walletCard: {
    margin: 20,
    borderRadius: 10,
  },
  walletText: {
    fontSize: 16,
    marginBottom: 10,
  },
  depositButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  withdrawButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  transactionCard: {
    margin: 10,
    borderRadius: 10,
  },
  transactionText: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  confirmButton: {
    alignSelf: 'center',
  },
});

export default WalletDetailsScreen;