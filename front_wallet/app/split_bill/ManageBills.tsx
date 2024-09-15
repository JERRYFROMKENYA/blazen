import React, {useEffect, useState} from 'react';
import {  StyleSheet, FlatList } from 'react-native';
import {Text, Button, Appbar, Card, Surface} from 'react-native-paper';
import { View } from '@/components/Themed';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import {useRouter} from "expo-router";
import {usePocketBase} from "@/components/Services/Pocketbase";
import {useAuth} from "@/app/(auth)/auth";


const ManageBillsScreen = () => {
    const router =useRouter()
    const { user } = useAuth();
    const {pb}=usePocketBase()
    const [myBills, setMyBills]=useState([])
    const [myFriendsBills, setMyFriendsBills]=useState([])
  const bills = [
    { id: 1, name: 'Dinner with Friends', totalAmount: 100 },
    { id: 2, name: 'Office Party', totalAmount: 200 },
    // Add more bills as needed
  ];
    const fetchBills = async () => {
        fetchMyBills()
        fetchMyFriendsBills()
    }
    const fetchMyBills = async () => {
        const myBills = await pb.collection('vows').getFullList({
            filter:`created_by="${user.id}"`
        });
        setMyBills(myBills)


    }
    const fetchMyFriendsBills = async () => {
        const myBills = await pb.collection('vow_participants').getFullList({
            filter:`user="${user.id}"`,
            expand:"vow, vow.created_by"
        })

        setMyFriendsBills(myBills.filter(bill=>bill.expand.vow.created_by!==user.id))

    }

    useEffect(() => {
        fetchBills().then(()=>{
            console.log(myFriendsBills)
        });

    }, [pb,user]);

  const handleViewBill = (bill) => {
    // navigation.navigate('BillDetails', { bill });
    router.push(`/split_bill/BillDetails/${bill.id}`);
  };

  return (
    <SafeScreen >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Manage Bills" />
      </Appbar.Header>
       <Surface style={{padding:10, marginTop:10, borderRadius:30}} elevation={3}>
           <Text style={{margin:5, alignSelf:"center"}}  variant={"titleSmall"}>My Bills</Text>
           <FlatList
               data={myBills}
               renderItem={({ item }) => (
                   <Card style={styles.billCard}>
                       <Card.Content>
                           <View style={styles.billItem}>
                               <Text style={styles.billText}>{item.description}: {item.total_amount.currency} {item.total_amount.amount}</Text>
                               <Button mode="contained" onPress={() => handleViewBill(item)} style={styles.viewButton}>
                                   View
                               </Button>
                           </View>
                       </Card.Content>
                   </Card>
               )}
               keyExtractor={item => item.id.toString()}
           />


       </Surface>
        <Surface style={{padding:10, marginTop:10, borderRadius:30}} elevation={3}>
            <Text style={{margin:5, alignSelf:"center"}} variant={"titleSmall"}>Other Bills</Text>
            <FlatList
                data={myFriendsBills}
                renderItem={({ item }) => (
                    <Card style={styles.billCard}>
                        <Card.Content>
                            <View style={styles.billItem}>
                                <Text style={styles.billText}>{item.expand.vow.description}: {item.expand.vow.total_amount.currency} {item.expand.vow.total_amount.amount} by {item.expand.vow.expand.created_by.first_name}</Text>
                                <Button mode="contained" onPress={() => handleViewBill(item.expand.vow)} style={styles.viewButton}>
                                    View
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                )}
                keyExtractor={item => item.id.toString()}
            />


        </Surface>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
      marginTop:10
  },
  billCard: {
    marginBottom: 10,
    borderRadius: 10,
  },
  billItem: {
      backgroundColor:"transparent",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billText: {
    fontSize: 16,
  },
  viewButton: {
    marginLeft: 10,
  },
});

export default ManageBillsScreen;