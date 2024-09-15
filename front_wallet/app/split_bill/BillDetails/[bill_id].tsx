import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, Share } from 'react-native';
import {Text, Appbar, ActivityIndicator, Button} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePocketBase } from "@/components/Services/Pocketbase";
import { View } from "@/components/Themed";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import {useAuth} from "@/app/(auth)/auth";

const BillDetails = () => {
  const router = useRouter();
  const { pb } = usePocketBase();
  const {user}=useAuth()
  const { bill_id } = useLocalSearchParams();
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [isOwner, setIsOwner] = useState(false);


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
          sort: "-created"
        });
        setPayments(paymentList);
      } catch (error) {
        console.error('Error fetching bill details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetails().then(()=>{
        console.log(billDetails)
    });
    console.log(billDetails)
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

  if (loading) {
    return <ActivityIndicator animating={true} />;
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
        {billDetails&&(<View style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          margin: 20,
          flexWrap: "wrap"
        }}>
          <Button style={{margin: 5}} mode={"contained"} disabled={!billDetails.complete || false}>
            Complete Payment
          </Button>
          <Button mode={"contained"} disabled={billDetails.complete || false}>
            Contribute
          </Button>
          {isOwner && (<Button mode={"contained-tonal"}>
            Delete Bill</Button>)}
        </View>)}
        <Text variant="titleLarge">Bill</Text>
        {billDetails&&(<View style={styles.historyItem}>
          <Text>{`Bill Created by ${billDetails.expand.created_by.first_name}`}</Text>
          <Text>{`Total Amount: ${billDetails.total_amount.amount} ${billDetails.total_amount.currency} to ${billDetails.expand.beneficiary.name}`}</Text>
          <Text>{`Description: ${billDetails.description}`}</Text>
          <Text>{`Date: ${new Date(billDetails.created).toLocaleDateString()}`}</Text>
        </View>)}
        <Text variant="titleLarge">Payment History</Text>
        {/*<FlatList*/}
        {/*  data={payments}*/}
        {/*  keyExtractor={(item) => item.id}*/}
        {/*  renderItem={({ item }) => (*/}
        {/*    <View style={styles.historyItem}>*/}
        {/*      <Text>{`Payment of ${item.amount} ${item.currency} by ${item.paid_by}`}</Text>*/}
        {/*      <Text>{`Date: ${new Date(item.created).toLocaleDateString()}`}</Text>*/}
        {/*    </View>*/}
        {/*  )}*/}
        {/*/>*/}
      </SafeScreen>


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