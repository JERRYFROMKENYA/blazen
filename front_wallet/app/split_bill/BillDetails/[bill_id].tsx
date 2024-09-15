import React, { useEffect, useState } from 'react';
import {StyleSheet, FlatList, Share, Alert} from 'react-native';
import { Text, Appbar, ActivityIndicator, Button, Dialog, Portal, Paragraph } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePocketBase } from "@/components/Services/Pocketbase";
import { View } from "@/components/Themed";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { useAuth } from "@/app/(auth)/auth";
import PayBillModal from '@/components/PayBillModal';
import {useLoading} from "@/components/utils/LoadingContext";

const BillDetails = () => {
  const router = useRouter();
  const { pb } = usePocketBase();
  const { user } = useAuth();
  const { bill_id } = useLocalSearchParams();
  const [billDetails, setBillDetails] = useState(null);
  const [loading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [amountToPay, setAmountToPay] = useState('');
  const [paidOff, setPaidOff] = useState(false);
  const {setLoading}=useLoading()

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const bill = await pb.collection('vows').getFirstListItem(`id="${bill_id}"`, {
          expand: 'created_by,beneficiary'
        });
        if (bill.created_by === user.id) {
          setIsOwner(true);
        }
        setBillDetails(bill);

        const paymentList = await pb.collection("vow_payments").getFullList({
          filter: `vow="${bill_id}"`,
          sort: "-created",
          expand:"vow,user"
        })
        let amountPaid = 0;
        for (let i = 0; i < paymentList.length; i++) {
          amountPaid+=paymentList[i].amount;
        }
        if(amountPaid >= bill.total_amount.amount){
          setPaidOff(true);

        }
        setPayments(paymentList);
      } catch (error) {
        console.error('Error fetching bill details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetails();
  }, [bill_id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Bill Details:
        \nTotal Amount: ${billDetails.total_amount.amount} ${billDetails.total_amount.currency}
        \nDescription: ${billDetails.description}
        \nCreated by: ${billDetails.expand.created_by.first_name}
        \nBeneficiary: ${billDetails.expand.beneficiary.name}\n
        \nRef:${bill_id}`,
      });
    } catch (error) {
      console.error('Error sharing bill details:', error);
    }
  };

  const handlePayBill = (amount) => {
    setAmountToPay(amount);
    setConfirmVisible(true);
  };

  const confirmPayment = async () => {
    setLoading(true);
    setConfirmVisible(false);
    if (paidOff) {
      alert("This bill has already been paid off");
      setLoading(false);
      return;
    }
    const biggest_wallet = await pb.collection('wallet').getFirstListItem(
      `user="${user.id}" && currency="${billDetails.total_amount.currency}"`,{
      sort: "-balance" });
    if (biggest_wallet.balance < amountToPay) {
      alert("You don't have enough funds in your wallet to pay this bill");
      setLoading(false);
      return;
    }
    const new_amount = biggest_wallet.balance - amountToPay;
    await pb.collection('wallet').update(biggest_wallet.id, { balance: new_amount });
    await pb.collection('vow_payments').create({
      vow: bill_id,
      amount: amountToPay,
      exchangeId: biggest_wallet.id,
      user: user.id
    });
    Alert.alert('Payment Successful',
        `You have successfully paid ${billDetails.total_amount.currency} ${amountToPay} for bill ${bill_id}`);

    console.log(`Paying ${amountToPay} for bill ${bill_id}`);
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator animating={true} />;
  }
  function handleComplete(){
    pb.collection("vows").update(bill_id,{complete:true})
  Alert.alert("Bill Completed","Bill has been marked as completed");
    router.push("/actions/bill_split")
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Bill Details" />
        <Appbar.Action icon="share" onPress={handleShare} />
      </Appbar.Header>
      <SafeScreen>
        <View style={styles.qrContainer}>
          <QRCode value={bill_id} size={150} />
        </View>
        {(billDetails && !billDetails.complete) && (
          <View style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "center",
            margin: 20,
            flexWrap: "wrap"
          }}>
            <Button style={{ margin: 5 }} mode={"contained"} disabled={!paidOff || false} onPress={()=>{handleComplete()}}>
              Complete Payment
            </Button>
            <Button mode={"contained"} disabled={paidOff || false} onPress={() => setModalVisible(true)}>
              Contribute
            </Button>
            {isOwner && (<Button mode={"contained-tonal"}>
              Delete Bill</Button>)}
          </View>
        )}
        {billDetails && billDetails.complete && (<Text>This Bill Has Been Paid Off</Text>)}
        <Text variant="titleLarge">Bill</Text>
        {billDetails && (
          <View style={styles.historyItem}>
            <Text>{`Bill Created by ${billDetails.expand.created_by.first_name}`}</Text>
            <Text>{`Total Amount: ${billDetails.total_amount.amount} ${billDetails.total_amount.currency} to ${billDetails.expand.beneficiary.name}`}</Text>
            <Text>{`Description: ${billDetails.description}`}</Text>
            <Text>{`Date: ${new Date(billDetails.created).toLocaleDateString()}`}</Text>
          </View>
        )}
        <Text variant="titleLarge">Payment History</Text>
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text>{`Payment of ${item.amount} ${item.expand.vow.total_amount.currency} by ${item.expand.user.first_name}`}</Text>
              <Text>{`Date: ${new Date(item.created).toLocaleDateString()}`}</Text>
            </View>
          )}
        />
      </SafeScreen>
      <PayBillModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handlePayBill}
      />
      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Confirm Payment</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to pay {amountToPay}?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
            <Button onPress={confirmPayment}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#fff",
    width: "45%",
    alignSelf: "center"
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default BillDetails;