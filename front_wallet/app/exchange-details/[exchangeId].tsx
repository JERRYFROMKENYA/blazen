import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, View, ScrollView } from 'react-native';
import {Appbar, Button, Chip, Surface, Text, TextInput} from 'react-native-paper';
import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { usePocketBase } from "@/components/Services/Pocketbase";
import { formatNumberWithCommas } from "@/components/utils/format";
import { useAuth } from "@/app/(auth)/auth";
import {MaterialIcons} from "@expo/vector-icons";
import {useLoading} from "@/components/utils/LoadingContext";

interface Exchange {
    status: string;
    expand: {
        pfi: {
            name: string;
        };
    };
    rfq: {
        data: {
            payin: {
                currencyCode: string;
                amount: number;
            };
        };
        metadata: {
            to: string;
            exchangeId: string;
        };
    };
}

interface Transaction {
    fees_charged: {
        currency: string;
        amount: number;
    };
}

export default function ExchangeId() {
    const router = useRouter();
    const { exchangeId } = useLocalSearchParams();
    const { pb } = usePocketBase();
    const [exchange, setExchange] = useState<Exchange | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [customerDid, setCustomerDid] = useState({});
    const [wallet, setWallet] = useState({});
    const { user } = useAuth();
    const [isRated, setIsRated] = useState(false);
    const [tbdNetInfo, settbdNetInfo] = useState<any[]>([]);
    const {setLoading}= useLoading()
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState<string>('');
    const [hasRated, setHasRated] = useState<boolean>(false);
    const [predefinedComments] = useState<string[]>([
        "Great service!",
        "Could be better.",
        "Had some issues.",
        "Excellent experience.",
        "Not satisfied."
    ]);
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const getStatusColor = (status: string) => {
        if (!status) status="default"
        console.log(status.toLowerCase())
        switch (status.toLowerCase()) {
            case 'success':
                return '#4CAF50';
            case 'in_progress':
                return '#4CAF50';// Green for success
            case 'pending':
                return '#FFC107';
            case 'transfering_funds':
                return '#FFC107';// Yellow for pending
            case 'failed':
                return '#F44336'; // Red for failed
            default:
                return '#9E9E9E'; // Grey for unknown status
        }

        // return "#9E9E9E"
    };
    const submitRating = async () => {
        setLoading(true)
        try {
            const existingRating = await pb.collection('pfi_rating').getFirstListItem(`user="${user.id}" && exchangeId="${exchangeId}"`);
            if (existingRating) {
                Alert.alert("Error", "You have already rated this exchange.");
                return;
            }
        }
        catch (e) {
            
        }
        if (!selectedRating || !comment) {
            Alert.alert("Error", "Please provide a rating and a comment.");
            setLoading(false)
            return;
        }
        

    try {
        // Check if the user has already rated this exchangeId
        

        // Submit the rating
        const data = {
            comment,
            pfi: exchange.expand.pfi.id,
            rating: selectedRating,
            user: user.id,
            exchangeId,
        };
        await pb.collection('pfi_rating').create(data);
        setHasRated(true);
        setLoading(false)
        Alert.alert("Success", "Your rating has been submitted.");
    } catch (error) {
            setLoading(false)
        console.error("Error submitting rating:", error);
        Alert.alert("Error", "Failed to submit rating.");
    }
};

    const toSentenceCase = (str: string) => {
        if (!str) return str;
        if(str.toLowerCase()=="orderstatus") return "Order Status"
        if(str.toLowerCase()=="rfq") return "RFQ"
        if(str.toLowerCase()=="close") return "Cancel"
        return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()).replaceAll("_", " ");
    };

    const getExchangeDetails = async () => {
        try {
            const did = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`);
            setCustomerDid(did);

            const quote_data: Exchange = await pb.collection("customer_quotes").getFirstListItem(`exchangeId = "${exchangeId}"`,{expand:'pfi'});
            if (!quote_data) {
                throw new Error('Quote data not found');
            }
            if(quote_data.status === "pending") {
            setIsPending(true)
            }

            setExchange(quote_data);

            const wallet_data = await pb.collection("wallet").getFirstListItem(`user="${user.id}"&&currency="${quote_data.rfq.data.payin.currencyCode}"&&balance>${Math.round(Number(quote_data.rfq.data.payin.amount) + Number(quote_data.rfq.data.payin.amount * 0.0035))}`);
            if (wallet_data) {
                setWallet(wallet_data);
            }
        } catch (error) {
            // console.error('Failed to fetch exchange details:', error);
        }
    };

    const getTransactionData = async () => {
        try {
            const transaction= await pb.collection("transaction").getFirstListItem(`ref = "${exchangeId}"`);
            setTransaction(transaction);
            console.log(transaction);
        } catch (error) {
            // console.error('Failed to fetch transaction details:', error);
        }
    };

    const getRating = async () => {
        try {
            const rating= await pb.collection("pfi_rating").getFirstListItem(`exhangeId = "${exchangeId}"`);
            if(rating) setHasRated(true);
        } catch (error) {
            // console.error('Failed to fetch transaction details:', error);
        }
    }

    const calculateTotal = () => {
        if (!exchange || !transaction) return 0;
        return exchange.rfq.data.payin.currencyCode + " " + formatNumberWithCommas(Math.round(Number(exchange.rfq.data.payin.amount) + Number(transaction.fees_charged.amount)));
    };

    useEffect(() => {
        if (exchangeId) {
            setLoading(true)
            getExchangeDetails().then((r)=>{
                getTransactionData().then(r=>{
                    setLoading(false)
                })
            });


        }
    }, [exchangeId]);

    const getNetInfo = async () => {
        const quoteResponse = await fetch('http://138.197.89.72:3000/get-exchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exchangeId: exchangeId,
                pfiUri: exchange?.rfq?.metadata?.to,
                customerDid: customerDid.did,
            }),
        });
        const quote_data = await quoteResponse.json();
        settbdNetInfo(quote_data);
    };

    useEffect(() => {
        getNetInfo();
    }, [customerDid, exchange, exchangeId]);

    const confirmQuote = async () => {
        if (!exchange) {
            // console.error('Exchange is null or undefined');
            return;
        }

        const res = await fetch('http://138.197.89.72:3000/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exchangeId: exchange.rfq.metadata.exchangeId,
                pfiUri: exchange.rfq.metadata.to,
                customerDid: customerDid.did,
            }),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        if (res.ok) {
            const data = {
                "wallet": wallet.id,
                "recepient": "",
                "external_address": `${exchange.rfq.metadata.to}`,
                "is_external": true,
                "description": "An external tbd recepient",
                "ref": `${exchange.rfq.metadata.exchangeId}`,
                "comment": "tbd transaction",
                "external_provider": "tbd",
                "status": "success",
                "reason": "Send Money",
                "fees_charged": { amount: exchange.rfq.data.payin.amount * 0.035, currency: exchange.rfq.data.payin.currencyCode },
            };

            const record = await pb.collection('transaction').create(data);
            const wallet_data = await pb.collection('wallet').getFirstListItem(`id = "${wallet.id}"`);
            const current_amount = wallet_data.balance;
            const new_amount = Number(current_amount) - (Number(exchange.rfq.data.payin.amount) + Math.round(Number(exchange.rfq.data.payin.amount * 0.035)));
            const new_amount_record = await pb.collection('wallet').update(wallet.id, { balance: new_amount });

            if (record && new_amount_record) {
                console.log("Transaction record created successfully");
                Alert.alert("Transaction Successful", "Your transaction has been completed successfully");
            } else {
                console.log("Transaction record creation failed");
                Alert.alert("Order Failed", "Your order has failed, contact support with the following information, rfq_id " + exchange.rfq.metadata.exchangeId);
            }
            router.push('/(tabs)/');
        }
    };

    const cancelQuote = async () => {
        if (!exchange) {
            // console.error('Exchange is null or undefined');
            return;
        }

        const res = await fetch('http://138.197.89.72:3000/close', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exchangeId: exchange.rfq.metadata.exchangeId,
                pfiUri: exchange.rfq.metadata.to,
                customerDid: customerDid.did,
                reason: "User Cancelled"
            }),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        if (res.ok) {
            const data = {
                "wallet": wallet.id,
                "recepient": "",
                "external_address": `${exchange.rfq.metadata.to}`,
                "is_external": true,
                "description": "An external tbd recepient",
                "ref": `${exchange.rfq.metadata.exchangeId}`,
                "comment": "tbd transaction",
                "external_provider": "tbd",
                "status": "failed",
                "reason": "Send Money",
                "fees_charged": { amount: exchange.rfq.data.payin.amount * 0.035, currency: exchange.rfq.data.payin.currencyCode },
            };

            const record = await pb.collection('transaction').create(data);
            const wallet_data = await pb.collection('wallet').getFirstListItem(`id = "${wallet.id}"`);
            const current_amount = wallet_data.balance;

            if (record) {
                console.log("Transaction record created successfully");
                Alert.alert("You have cancelled this transaction", "Your transaction has been cancelled successfully");
            } else {
                console.log("Transaction record creation failed");
                Alert.alert("Order Failed", "Your order has failed, contact support with the following information, rfq_id " + exchange.rfq.metadata.exchangeId);
            }
            router.push('/(tabs)/');
        }
    };

    return (
        <View style={{ height: '100%' }}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Exchange Details" />
            </Appbar.Header>
            <SafeScreen onRefresh={() => { }}>
                {exchange && (
                    <>
                        <Surface style={{ flexDirection: "column", width: "100%", marginVertical: 30, justifyContent: "center", alignItems: "center", padding: 5, borderRadius: 10 }} elevation={3}>
                            <Text variant={"bodyLarge"}>Exchange ID: {exchangeId}</Text>
                            <Text variant={"bodyLarge"}>PFI: {exchange.expand.pfi.name}</Text>
                            <Text variant={"bodyLarge"}>Transaction Status: {toSentenceCase(exchange.status)}</Text>
                            <Text variant={"bodyLarge"}>You're sending: {exchange.rfq.data.payin.currencyCode} {formatNumberWithCommas(exchange.rfq.data.payin.amount)}</Text>
                        </Surface>
                        {(transaction && exchange.status != "cancelled") && (
                            <Surface style={{ flexDirection: "column", width: "100%", marginVertical: 20, justifyContent: "center", alignItems: "center", padding: 5, borderRadius: 10 }} elevation={3}>
                                <Text variant={"bodyLarge"}>NexX Facilitation Fees: {transaction.fees_charged.currency} {Math.round(transaction.fees_charged.amount)}</Text>
                                <Text variant={"bodyLarge"}>Total: {calculateTotal()}</Text>
                            </Surface>
                        )}
                    </>
                )}

                {(!hasRated && !isPending) && (
                    <Surface style={{ padding: 20, margin: 20, borderRadius: 10 }} elevation={3}>
                        <Text variant={"bodyLarge"}>Rate this Transaction</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
                            {[1, 2, 3, 4, 5].map((value) => (
                                <Chip
                                    key={value}
                                    selected={selectedRating === value}
                                    onPress={() => setSelectedRating(value)}
                                    style={{ marginHorizontal: 5 }}
                                >
                                    {value}
                                </Chip>
                            ))}
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 10 }}>
                            {predefinedComments.map((comment, index) => (
                                <Chip
                                    key={index}
                                    onPress={() => setComment(comment)}
                                    style={{ margin: 5 }}
                                >
                                    {comment}
                                </Chip>
                            ))}
                        </View>
                        <TextInput
                            label="Comment"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                        />
                        <Button onPress={()=>{submitRating()}}>Submit Rating</Button>
                    </Surface>
                )}
                {isPending && <Surface elevation={2} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, borderRadius:50 }}>
                    <Button style={{ flex: 1 }} onPress={() => { confirmQuote(); }} textColor={'gray'}>Confirm</Button>
                    <Button style={{ flex: 1 }} textColor={'red'} onPress={() => { cancelQuote() }}>Cancel</Button>
                </Surface>}
                {tbdNetInfo.length > 0 && (
                    <>
                        <Text variant={"titleLarge"} style={{ marginVertical: 20, textAlign: 'center' }}>Transaction History</Text>
                        <ScrollView style={{ marginBottom: 300 }}>
                            {tbdNetInfo.map((info, index) => (
                                <Surface
                                    key={index}
                                    style={{
                                        flexDirection: "column",
                                        width: "100%",
                                        marginVertical: 10,
                                        padding: 15,
                                        borderRadius: 10,
                                        // backgroundColor: "#f5f5f5", // Light background color for the cards
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        elevation: 3,
                                    }}
                                    elevation={2}
                                >
                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                        <MaterialIcons name="access-time" size={20} color="#616161" />
                                        <Text style={{ marginLeft: 5, fontWeight: "bold", fontSize: 16 }}>Time:</Text>
                                    </View>
                                    <Text style={{ marginLeft: 25, fontSize: 14, color: "#757575" }}>{new Date(info.metadata.createdAt).toLocaleString()}</Text>

                                    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                                        <MaterialIcons name="category" size={20} color="#616161" />
                                        <Text style={{ marginLeft: 5, fontWeight: "bold", fontSize: 16 }}>Kind:</Text>
                                    </View>
                                    <Text style={{ marginLeft: 25, fontSize: 14, color: "#757575" }}>{toSentenceCase(info.metadata.kind)}</Text>

                                    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                                        <MaterialIcons name="swap-horiz" size={20} color="#616161" />
                                        <Text style={{ marginLeft: 5, fontWeight: "bold", fontSize: 16 }}>Protocol:</Text>
                                    </View>
                                    <Text style={{ marginLeft: 25, fontSize: 14, color: "#757575" }}>{info.metadata.protocol}</Text>

                                    {/* Status with color coding */}
                                    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                                        <MaterialIcons name="check-circle" size={20} color={getStatusColor(info.data.orderStatus||"default")} />
                                        <Text style={{
                                            marginLeft: 5,
                                            fontWeight: "bold",
                                            fontSize: 16,
                                            color: getStatusColor(info.data.orderStatus||"default"),
                                        }}>
                                            Status: {toSentenceCase(info.data.orderStatus||"pending")}
                                        </Text>
                                    </View>

                                    {/* Amount Sent */}
                                    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                                        <MaterialIcons name="attach-money" size={20} color="#616161" />
                                        <Text style={{ marginLeft: 5, fontWeight: "bold", fontSize: 16 }}>Amount Sent:</Text>
                                    </View>
                                    <Text style={{ marginLeft: 25, fontSize: 14, color: "#757575" }}>
                                        {exchange.rfq.data.payin.currencyCode} {formatNumberWithCommas(exchange.rfq.data.payin.amount)}
                                    </Text>

                                    {/* Fees */}
                                    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                                        <MaterialIcons name="account-balance-wallet" size={20} color="#616161" />
                                        <Text style={{ marginLeft: 5, fontWeight: "bold", fontSize: 16 }}>Fees Charged:</Text>
                                    </View>
                                    <Text style={{ marginLeft: 25, fontSize: 14, color: "#757575" }}>
                                        {transaction?.fees_charged.currency} {formatNumberWithCommas(Math.round(transaction?.fees_charged.amount||0))}
                                    </Text>

                                    {/* Total */}
                                    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
                                        <MaterialIcons name="calculate" size={20} color="#616161" />
                                        <Text style={{ marginLeft: 5, fontWeight: "bold", fontSize: 16 }}>Total:</Text>
                                    </View>
                                    <Text style={{ marginLeft: 25, fontSize: 14, color: "#757575" }}>{calculateTotal()}</Text>
                                </Surface>
                            ))}
                            <Text style={{alignSelf:"center",padding:50}} variant={"bodySmall"}>History is Powered by the tbDEX network</Text>
                        </ScrollView>
                    </>
                )}
            </SafeScreen>
        </View>
    );
}