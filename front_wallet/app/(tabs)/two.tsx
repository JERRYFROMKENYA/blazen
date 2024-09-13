// `app/(tabs)/two.tsx`
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import React, {useState} from "react";
import {Appbar, Avatar, Text, Surface, Button, List, MD3Colors} from "react-native-paper";
import {View} from "@/components/Themed";
import { TouchableOpacity, Linking } from "react-native";
import {useAuth} from "@/app/(auth)/auth";
import {useEffect} from "react";
import {usePocketBase} from "@/components/Services/Pocketbase";
import * as FileSystem from 'expo-file-system';
import {useRouter} from "expo-router";
import {formatNumberWithCommas} from "@/components/utils/format";


interface User {
    name: string;
    avatar: string;
}

export default function Transactions() {
    const router =useRouter();
    const [avatar, setAvatar] = useState("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQimIXWmgpyuYaqMRDE3BdO183iSVJ_T2JUNg&s");
    const {user, signOut}=useAuth();
    const {pb}=usePocketBase();
    const [did, setDid] = useState("loading...");
    const [expanded, setExpandedTransactions] = React.useState(true);
    const [completedTransactions, setCompletedTransactions] = React.useState([]);
    const [pendingTransactions, setPendingTransactions] = React.useState([]);
    const [failedTransactions, setFailedTransactions] = React.useState([]);


    const fetchTransactions = async () => {
        const transactions = await pb.collection('customer_quotes').
        getFullList({filter:`rfq.metadata.from = "${did.uri}"`, expand: 'pfi'});
        console.log(transactions);
        setCompletedTransactions(transactions.filter((t: any) => t.status === 'completed'));
        setPendingTransactions(transactions.filter((t: any) => t.status === 'pending'));
        setFailedTransactions(transactions.filter((t: any) => t.status === 'cancelled'));
        console.log("completed: ",completedTransactions);
        if(transactions.length === 0){
           fetchTransactions().then(r => r);
        }
    }

    const getDid = async () => {
        const did = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`,{
            sort: 'updated',
        });
        setDid(did.did);
        console.log(did);
    }
    useEffect(() => {
        getDid().then(r => r);
        fetchTransactions().then(r => {})
        refreshTransactions()
        console.log(user);
        console.log(avatar);
    }, [user,pb,router]);

    const go_to_details = (exchangeId: string) => {
        router.push(`/exchange-details/${exchangeId}`);
    }
    const refreshTransactions = () => {
        fetchTransactions().then(r => {

        })
    }





    const exportDidToJson = async () => {
        const fileUri = FileSystem.documentDirectory + 'portable_did.json';
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(did), { encoding: FileSystem.EncodingType.UTF8 });
        alert(`DID exported to ${FileSystem.documentDirectory}/portable_did.json`);
    };

    const handleLearnMore = () => {
        Linking.openURL('https://example.com/learn-more');
    };
    const handleSignOut =()=>{
        // sign out
        signOut();
        router.replace('/(auth)/login')
    }

    return (
        <View style={{height:"100%"}}>
            <Appbar.Header>
                <Appbar.Content title="Transactions" />
            </Appbar.Header>
            <SafeScreen onRefresh={()=>{refreshTransactions()}}>
                <Surface elevation={2} style={{width:"100%",
                    padding:30,
                    marginBottom:10,
                    marginTop:10,
                    flexDirection:"column",borderRadius:20,
                    justifyContent:"space-between",alignItems:"center"}}>
                    <Text variant={"titleSmall"}>DID: Decentralized Identifier</Text>
                    <Text variant={"titleSmall"} style={{margin:5}}> {did.uri||"loading ..."}</Text>
                    <View style={{justifyContent:"flex-end",alignContent:"space-between",flexDirection:"row",backgroundColor:"transparent", margin:5}}>
                        <Text style={{flex:1,alignSelf:"flex-start"}} onPress={()=>{router.push('/DID/manage_did')}} variant={"titleSmall"}>Manage</Text>
                        <Text style={{alignSelf:"flex-end", color:"gray"}} variant={"titleSmall"} onPress={handleLearnMore}>Learn More</Text>
                    </View>
                    <Text variant={"bodySmall"}>This DID is currently associated with the following transactions</Text>
                </Surface>

                <Surface elevation={0} style={{width:"100%",
                    marginBottom:10,
                    flexDirection:"column",borderRadius:5,
                    justifyContent:"space-between",alignItems:"center"}}>
                    <Text variant={"bodySmall"} style={{marginBottom:10}}>Showing Transactions Done On The TBDEX Network on the NexX App</Text>
                    <List.AccordionGroup >
                        <View style={{width:"100%",backgroundColor:"transparent"}}>
                            <List.Accordion title="Completed" id="3">
                                {
                                    completedTransactions.map((t: any) => {
                                        return (
                                            <List.Item
                                                key={t.exchangeId}
                                                descriptionStyle={{lineHeight:20,fontSize:12,fontWeight:"bold", width:"100%"}}
                                                style={{}}
                                                title={t.expand.pfi.name}
                                                onPress={()=>{go_to_details(t.exchangeId)}}
                                                description={`Amount: ${t.rfq.data.payin.currencyCode} ${formatNumberWithCommas(t.rfq.data.payin.amount)}\n Date: ${t.updated}`}
                                                left={props => <List.Icon {...props} icon="check" />}
                                            />
                                        )
                                    })
                                }
                            </List.Accordion>
                        </View>
                    </List.AccordionGroup>
                    <List.AccordionGroup >
                        <View style={{width:"100%",backgroundColor:"transparent"}}>
                            <List.Accordion title="Pending" id="3">
                                {
                                    pendingTransactions.map((t: any) => {
                                        return (
                                            <List.Item
                                                key={t.exchangeId}
                                                descriptionStyle={{lineHeight:20,fontSize:12,fontWeight:"bold", width:"100%"}}
                                                style={{}}
                                                title={t.expand.pfi.name}
                                                onPress={()=>{go_to_details(t.exchangeId)}}
                                                description={`Amount: ${t.rfq.data.payin.currencyCode} ${formatNumberWithCommas(t.rfq.data.payin.amount)}\n Date: ${t.updated}`}
                                                left={props => <List.Icon {...props} icon="exclamation" />}
                                            />
                                        )
                                    })
                                }
                            </List.Accordion>
                        </View>
                    </List.AccordionGroup>
                    <List.AccordionGroup >
                        <View style={{width:"100%",backgroundColor:"transparent"}}>
                            <List.Accordion title="Failed" id="3">
                                {
                                    failedTransactions.map((t: any) => {
                                        return (
                                            <List.Item
                                                key={t.exchangeId}
                                                descriptionStyle={{lineHeight:20,fontSize:12,fontWeight:"bold", width:"100%"}}
                                                style={{}}
                                                title={t.expand.pfi.name}
                                                onPress={()=>{go_to_details(t.exchangeId)}}
                                                description={`Amount: ${t.rfq.data.payin.currencyCode} ${formatNumberWithCommas(t.rfq.data.payin.amount)}\n Date: ${t.updated}`}
                                                left={props => <List.Icon {...props} icon="close" />}
                                            />
                                        )
                                    })
                                }
                            </List.Accordion>
                        </View>
                    </List.AccordionGroup>

                </Surface>

                <Surface elevation={0} style={{width:"100%",
                    padding:5,
                    marginBottom:150,
                    flexDirection:"column",borderRadius:20,
                    justifyContent:"space-between",alignItems:"center"}}>
                    <Text variant={"bodySmall"}>©️ 2024 NexX, powered by tbDex</Text>
                </Surface>

            </SafeScreen>
        </View>
    );
}