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
import {useLoading} from "@/components/utils/LoadingContext";
import {PieChart} from "react-native-gifted-charts";


interface User {
    name: string;
    avatar: string;
}

export default function Transactions() {
    const router = useRouter();
    // const [avatar, setAvatar] = useState("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQimIXWmgpyuYaqMRDE3BdO183iSVJ_T2JUNg&s");
    const {user, signOut} = useAuth();
    const {pb} = usePocketBase();
    const [did, setDid] = useState("loading...");
    // const [expanded, setExpandedTransactions] = React.useState(true);
    const [completedTransactions, setCompletedTransactions] = React.useState([]);
    const [pendingTransactions, setPendingTransactions] = React.useState([]);
    const [failedTransactions, setFailedTransactions] = React.useState([]);
    const [completed, setCompleted]=useState(1)
    const [pending, setPending] = React.useState(0)
    const [failed, setFailed] = React.useState(0)
    const {setLoading} = useLoading();


    const getDid = async () => {
        const did = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`, {
            sort: 'updated',
        });
        setDid(did.did);
        console.log(did);

        const fetchTransactions = async () => {
            const transactions = await pb.collection('customer_quotes').getFullList({
                filter: `rfq.metadata.from = "${did.did.uri}"`,
                expand: 'pfi'
            });
            console.log(transactions);
            setCompletedTransactions(transactions.filter((t: any) => t.status === 'completed'));
            setPendingTransactions(transactions.filter((t: any) => t.status === 'pending'));
            setFailedTransactions(transactions.filter((t: any) => t.status === 'cancelled'));
            console.log("completed: ", completedTransactions);
            try{
                const completed =await pb.collection('successful_transactions').getFirstListItem(`user="${user.id}"`);
                setCompleted(completed.transaction_count);
            }
            catch (e) {

            }
            try{
                const pending =await pb.collection('pending_transactions').getFirstListItem(`user="${user.id}"`);
                setPending(pending.transaction_count);
            }
            catch (e) {

            }
            try{
                const failed =await pb.collection('failed_transactions').getFirstListItem(`user="${user.id}"`);
                setFailed(failed.transaction_count);
            }
            catch (e) {

            }

        }

        await fetchTransactions()
    }







    useEffect(() => {
        setLoading(true)
        getDid().then(()=>{
            setLoading(false)
        })

    }, [user,pb,router]);

    const go_to_details = (exchangeId: string) => {
        router.push(`/exchange-details/${exchangeId}`);
    }
    const refreshTransactions = () => {
        setLoading(true)
        getDid().then(()=>{
            setLoading(false)
        })
    }







    const handleLearnMore = () => {
        Linking.openURL('https://tbdex.io/trust-compliance');
    };
    const TransactionCharts=()=>{
        const total = completed+pending+failed
        const pieData = [
            {value: (completed/total*100), color: '#17d540', text: 'Successful'},
            {value: (pending/total*100), color: '#ded179', text: 'Pending'},
            {value: (failed/total*100), color: '#ED6665', text: 'Failed'},
        ];
        return(
            <View style={{flexDirection:"column", flex:1}}>
                <Surface style={{
                    alignItems:"center",
                    borderRadius:20,
                    width:"33%",
                    margin:5,
                    padding:5
                }}
                         elevation={0}
                >
                    <PieChart
                        showText
                        textColor="white"
                        radius={100}
                        textSize={12}
                        data={pieData}
                    />
                </Surface>


            </View>
        )
    }
    const TransactionSummaryWidget=()=>{
        return(
            <View style={{flexDirection:"row", width:"60%"}}>
                {(completed>0)&&<TransactionCharts/>}
                <View style={{flexDirection:"column", width:"40%",alignSelf:"flex-end"}}>
                <Surface style={{
                    justifyContent:"flex-end",
                    alignItems:"flex-end",
                    borderRadius:20,
                    width:"100%",
                    margin:5,
                    padding:5
                }}
                >
                    <Text variant={"headlineLarge"} style={{alignSelf:"center"}}>
                        {completed}
                    </Text>
                    <Text variant={"bodySmall"} style={{alignSelf:"center"}}>Successful </Text>

                </Surface>
                <Surface style={{
                    justifyContent:"flex-end",
                    alignItems:"flex-end",
                    borderRadius:20,
                    width:"100%",
                    margin:5,
                    padding:5
                }}>
                    <Text variant={"headlineLarge"} style={{alignSelf:"center"}}>
                        {pending}
                    </Text>
                    <Text variant={"bodySmall"} style={{alignSelf:"center"}}>Pending </Text>

                </Surface>
                <Surface style={{
                    justifyContent:"flex-end",
                    alignItems:"flex-end",
                    borderRadius:20,
                    width:"100%",
                    margin:5,
                    padding:5
                }}>
                    <Text variant={"headlineLarge"} style={{alignSelf:"center"}}>
                        {failed}
                    </Text>
                    <Text variant={"bodySmall"} style={{alignSelf:"center"}}>Cancelled </Text>
                </Surface>
                </View>
            </View>
        )
    }





    return (
        <View style={{height:"100%"}}>
            <Appbar.Header>
                <Appbar.Content title="Transactions" />
            </Appbar.Header>
            <SafeScreen onRefresh={()=>{refreshTransactions()}}>
                <Surface elevation={2} style={{width:"90%",
                    alignSelf:"center",
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


                <Surface elevation={0} style={{width:"90%",
                    alignSelf:"center",
                    marginBottom:10,
                    flexDirection:"column",borderRadius:5,
                    justifyContent:"space-between",alignItems:"center"}}>
                    <Text variant={"titleMedium"} style={{alignSelf:"flex-start", marginLeft:10}}>Summary</Text>
                    <TransactionSummaryWidget/>
                    <Text variant={"bodySmall"} style={{marginBottom:10}}>Showing Transactions Done On The TBDEX Network on the NexX App</Text>
                    <List.AccordionGroup>
                        <View style={{width:"100%",borderTopRightRadius:50,borderTopLeftRadius:50,backgroundColor:"transparent"}}>
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
                                                description={`Amount: ${t.rfq.data.payin.currencyCode} ${formatNumberWithCommas(t.rfq.data.payin.amount)}\n Date: ${new Date(t.updated).toLocaleString()}`}
                                                left={props => <List.Icon {...props} icon="check-circle" color={"green"}  />}
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
                                                description={`Amount: ${t.rfq.data.payin.currencyCode} ${formatNumberWithCommas(t.rfq.data.payin.amount)}\n Date: ${new Date(t.updated).toLocaleString()}`}
                                                left={props => <List.Icon {...props} color={"yellow"} icon="clock-time-three" />}
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
                                                description={`Amount: ${t.rfq.data.payin.currencyCode} ${formatNumberWithCommas(t.rfq.data.payin.amount)}\n Date: ${new Date(t.updated).toLocaleString()}`}
                                                left={props => <List.Icon {...props} icon="close-circle" color={"red"} />}
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



