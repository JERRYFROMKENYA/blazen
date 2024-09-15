import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View as RNView } from 'react-native';
import { TextInput, Button, Appbar, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { View } from '@/components/Themed';
import { BarCodeScanner } from 'expo-barcode-scanner';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import {useLoading} from "@/components/utils/LoadingContext";

const JoinBillScreen = () => {
  const router = useRouter();
  const [billCode, setBillCode] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [useScanner, setUseScanner] = useState(false);
  const { user } = useAuth();
  const { pb } = usePocketBase();
  const {setLoading}=useLoading()

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const checkIfMember = async (billId) => {
    const participants = await pb.collection('vow_participants').getFullList({
      filter: `vow="${billId}"`,
    });
    return participants.some(participant => participant.user === user.id);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoading(true)
    const isMember = await checkIfMember(data);
    if (isMember) {
      setLoading(false)
      Alert.alert('Already a Member', 'You are already a member of this bill.');
      return;
    }
    setLoading(true)
    const bill = await pb.collection('vows').getFirstListItem(`id="${data}"`, {
      expand: 'created_by,beneficiary'
    });
    setLoading(false)
    Alert.alert(
      'QR Code Scanned',
      `For: ${bill.description}\n Total: ${bill.total_amount.currency} ${bill.total_amount.amount} ` +
      `Bill ID: ${data}\nDo you want to join this bill?`,
      [
        {
          text: 'Cancel',
          onPress: () => setScanned(false),
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: async () => {
            setLoading(true)
            await pb.collection("vow_participants").create({
              vow: data,
              user: user.id,
              amount_due: bill.total_amount.amount
            });
            setLoading(false)
            router.push(`/split_bill/BillDetails/${data}`);
          },
        },
      ]
    );
  };

  const handleJoinBill = async () => {
    setLoading(true)
    const isMember = await checkIfMember(billCode);
    if (isMember) {
      setLoading(false)
      Alert.alert('Already a Member', 'You are already a member of this bill.');
      return;
    }
    setLoading(true)
    const bill = await pb.collection('vows').getFirstListItem(`id="${billCode}"`, {
      expand: 'created_by,beneficiary'
    });
    setLoading(false)
    Alert.alert(
      'Bill Code Entered',
      `For: ${bill.description}\n Total: ${bill.total_amount.currency} ${bill.total_amount.amount} ` +
      `Bill ID: ${billCode}\nDo you want to join this bill?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: async () => {
            setLoading(true)
            await pb.collection("vow_participants").create({
              vow: billCode,
              user: user.id,
              amount_due: bill.total_amount.amount
            });
            setLoading(false)
            router.push(`/split_bill/BillDetails/${billCode}`);
          },
        },
      ]
    );
  };

  if (hasPermission === null) {
    return <View><Text>Requesting for camera permission</Text></View>;
  }
  if (hasPermission === false) {
    return <View><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Join Bill" />
      </Appbar.Header>
      <SafeScreen>
        <Card style={styles.card}>
          <Card.Content>
            <Button mode="contained" onPress={() => setUseScanner(!useScanner)} style={styles.toggleButton}>
              {useScanner ? 'Use Manual Input' : 'Use QR Code Scanner'}
            </Button>
            {useScanner ? (
              <RNView style={styles.scannerContainer}>
                <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={StyleSheet.absoluteFillObject}
                />
                {scanned && (
                  <Button mode="contained" onPress={() => setScanned(false)} style={styles.scanAgainButton}>
                    Tap to Scan Again
                  </Button>
                )}
              </RNView>
            ) : (
              <RNView>
                <TextInput
                  label="Bill Code"
                  value={billCode}
                  onChangeText={setBillCode}
                  style={styles.input}
                />
                <Button mode="contained" onPress={handleJoinBill} style={styles.joinButton}>
                  Join Bill
                </Button>
              </RNView>
            )}
          </Card.Content>
        </Card>
      </SafeScreen>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  toggleButton: {
    marginBottom: 20,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    marginBottom: 20,
  },
  scanAgainButton: {
    marginTop: 20,
  },
  input: {
    marginBottom: 20,
  },
  joinButton: {
    marginTop: 10,
  },
});

export default JoinBillScreen;