import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, View } from 'react-native';
import {Appbar, Button, Surface, Text} from 'react-native-paper';
import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { usePocketBase } from "@/components/Services/Pocketbase";
import { formatNumberWithCommas } from "@/components/utils/format";
import { useAuth } from "@/app/(auth)/auth";

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
    const [isRated, setIsRated]=useState(false)
    const toSentenceCase = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    const getExchangeDetails = async () => {
        try {
            const did = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`);
            setCustomerDid(did);

            const quote_data: Exchange = await pb.collection("customer_quotes")
                .getFirstListItem(`exchangeId="${exchangeId}"`, {
                    expand: "pfi"
                });

            if (!quote_data) {
                console.error('quote_data is null or undefined');
                return;
            }

            if (!quote_data.status) {
                console.error('quote_data.status is null or undefined', quote_data);
                return;
            }

            setExchange(quote_data);



            if (quote_data.status !== "pending") {
                setIsPending(false);
                getTransactionData().then(r => {});
            } else {
                setIsPending(true);
            }

            const wallet_data = await pb.collection("wallet").getFirstListItem(`user="${user.id}"&&currency="${quote_data.rfq.data.payin.currencyCode}"&&balance>${Math.round(Number(quote_data.rfq.data.payin.amount) + Number(quote_data.rfq.data.payin.amount * 0.0035))}`);
            if (wallet_data) {
                setWallet(wallet_data);

            }

        } catch (error) {
            console.error('Failed to fetch exchange details:', error);
        }
    };

    const getTransactionData = async () => {
        try {
            const transaction: Transaction = await pb.collection("transaction")
                .getFirstListItem(`ref="${exchangeId}"`, {
                    expand: "wallet"
                });
            setTransaction(transaction);
        } catch (error) {
            console.error('Failed to fetch transaction details:', error);
        }
    };

    const calculateTotal = () => {
        if (!exchange || !transaction) return 0;
        return exchange.rfq.data.payin.currencyCode + " " + formatNumberWithCommas(Math.round(Number(exchange.rfq.data.payin.amount) + Number(transaction.fees_charged.amount)));
    };

    useEffect(() => {
        if (exchangeId) {
            getExchangeDetails().then(() => {
                console.log("Exchange", exchange?.status);
                console.log(wallet);
            });
        }

    }, [exchangeId]);

    const confirmQuote = async () => {
        if (!exchange) {
            console.error('Exchange is null or undefined');
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
            throw new Error(`HTTP error! 2 status: ${res.status}`);
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
                Alert.alert("Order Confirmed", "Your order has been confirmed successfully");
            } else {
                console.log("Transaction record creation failed");
                Alert.alert("Order Failed", "Your order has failed, contact support with the following information, rfq_id " + exchange.rfq.metadata.exchangeId);
            }
            router.push('/(tabs)/');
        }
    };

    const cancelQuote = async () => {
        if (!exchange) {
            console.error('Exchange is null or undefined');
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
            throw new Error(`HTTP error! 2 status: ${res.status}`);
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
                        <Surface style={{ flexDirection:"column",width:"100%",
                            marginVertical:30,
                            justifyContent: "center", alignItems: "center",
                            padding:5, borderRadius:10}} elevation={3}>
                            <Text variant={"bodyLarge"}>Exchange ID: {exchangeId}</Text>
                            <Text variant={"bodyLarge"}>PFI: {exchange.expand.pfi.name}</Text>
                            <Text variant={"bodyLarge"}>Transaction Status: {toSentenceCase(exchange.status)}</Text>
                            <Text variant={"bodyLarge"}>You're sending: {exchange.rfq.data.payin.currencyCode} {formatNumberWithCommas(exchange.rfq.data.payin.amount)}</Text>
                        </Surface>
                        {(transaction && exchange.status!="cancelled") && (
                            <Surface style={{ flexDirection:"column",width:"100%",
                                marginVertical:20,
                                justifyContent: "center", alignItems: "center",
                                padding:5, borderRadius:10}} elevation={3}>
                                <Text variant={"bodyLarge"}>NexX Facilitation Fees: {transaction.fees_charged.currency} {Math.round(transaction.fees_charged.amount)}</Text>
                                <Text variant={"bodyLarge"}>Total: {calculateTotal()}</Text>
                            </Surface>
                        )}

                        {(transaction && exchange.status!="cancelled") && (
                            <Surface style={{ flexDirection:"column",width:"100%",
                                marginVertical:20,
                                justifyContent: "center", alignItems: "center",
                                padding:5, borderRadius:10}} elevation={3}>
                                <Text variant={"bodyLarge"}>NexX Facilitation Fees: {transaction.fees_charged.currency} {Math.round(transaction.fees_charged.amount)}</Text>
                                <Text variant={"bodyLarge"}>Total: {calculateTotal()}</Text>
                            </Surface>
                        )}
                    </>
                )}
                {isPending&&<Surface elevation={2} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginTop: 20,

                }}>
                    <Button
                        style={{
                            flex: 1
                        }}
                        onPress={() => {
                            confirmQuote();
                        }}
                        textColor={'gray'}
                    >Confirm</Button>


                    <Button
                        style={{
                            flex: 1
                        }}
                        textColor={'red'}
                        onPress={() => {
                            cancelQuote()
                        }}>Cancel</Button>

                </Surface>}
            </SafeScreen>
        </View>
    );
}