import { useEffect, useState } from "react";
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { Button, Chip, Surface, Text } from "react-native-paper";
import React from "react";
import { useRouter } from "expo-router";
import {View} from "@/components/Themed";
import { useRef } from "react";
import {formatNumberWithCommas} from "../utils/format";
import {Alert} from "react-native";
import {useLoading} from "@/components/utils/LoadingContext";

export default function GetQuote({ paymentDetails, setShowQuote, offering, amount, setQuoteReceived, wallet }: {wallet:any, setQuoteReceived: Function,paymentDetails: any, showQuote: boolean, setShowQuote: Function, offering: any, amount: string }) {
    const router = useRouter();
    const hasFetchedQuote = useRef(false);
    const { pb } = usePocketBase();
    const { user } = useAuth();
    const [kcc, setKcc] = useState("");
    const [customerDid, setCustomerDid] = useState({});
    const [allCustomerVCs, setAllCustomerVCs] = useState([]);
    const [selectedVC, setSelectedVC] = useState({});
    const [showResponse, setShowResponse] = useState(false);
    const [rfq, setRfq] = useState({});
    const[quote,setQuote]=useState();
    const {setLoading} = useLoading();

    const toSentenceCase = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const refreshData = async () => {
        setLoading(true);
        const kcc = await pb.collection('customer_vc').getFullList({ filter: `user = "${user.id}"`, expand: "issuer" });
        setAllCustomerVCs(kcc);

        const customerDid = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`);
        setCustomerDid(customerDid);
        setLoading(false);
    };


    useEffect(() => {
        refreshData();
    }, [router]);

    const selectVC = (vc: any) => {
        setSelectedVC(vc);
    };


const fetchQuote = async () => {
    setLoading(true);
    const bodyData = {
        payoutPaymentDetails: paymentDetails,
        offering: offering,
        amount: amount,
        customerCredentials: selectedVC.vc,
        customerDid: customerDid.did
    };

    try {
        // Generate RFQ
        const rfqResponse = await fetch('http://138.197.89.72:3000/offerings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
        });

        if (!rfqResponse.ok) {
            throw new Error(`HTTP error! 1 status: ${rfqResponse.status}`);
        }

        const rfqData = await rfqResponse.json();
        setRfq(rfqData);

        // Fetch Quote using RFQ metadata
        const quoteResponse = await fetch('http://138.197.89.72:3000/get-exchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exchangeId: rfqData.metadata.exchangeId,
                pfiUri: rfqData.metadata.to,
                customerDid: customerDid.did,
            }),
        });




        if (!quoteResponse.ok) {
            throw new Error(`HTTP error! 2 status: ${quoteResponse.status}`);
        }

        const quoteData = await quoteResponse.json();
        setQuote(quoteData);
        setShowResponse(true);
        console.log(rfqData);
        console.log(quoteData[1]);
        setLoading(false);

    } catch (e) {
        // console.error('Error fetching quote:', e);
        setLoading(false);
    }
};

const confirmQuote = async () => {
    //
    setLoading(true);
    const res =await fetch('http://138.197.89.72:3000/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            exchangeId: rfq.metadata.exchangeId,
            pfiUri: rfq.metadata.to,
            customerDid: customerDid.did,
        }),
    });
    //
    if (!res.ok) {
        throw new Error(`HTTP error! 2 status: ${res.status}`);
    }
    if (res.ok) {
        const data = {
            "wallet": wallet.id,
            "recepient": "",
            "external_address": `${rfq.metadata.to}`,
            "is_external": true,
            "description": "An external tbd recepient",
            "ref": `${rfq.metadata.exchangeId}`,
            "comment": "tbd transaction",
            "external_provider": "tbd",
            "status": "success",
            "reason": "Send Money",
            "fees_charged": {amount:quote[1].data.payin.amount*0.035,currency:quote[1].data.payin.currencyCode},
        };

        const record = await pb.collection('transaction').create(data);
        const wallet_data = await pb.collection('wallet').getFirstListItem(`id = "${wallet.id}"`);
        const current_amount=wallet_data.balance;
        const new_amount=Number(current_amount)-(Number(quote[1].data.payin.amount)+Math.round(Number(quote[1].data.payin.amount*0.035)));
        const new_amount_record=await pb.collection('wallet').update(wallet.id,{balance:new_amount});

        if(record&&new_amount_record){
            console.log("Transaction record created successfully");
            Alert.alert("Order Confirmed","Your order has been confirmed successfully");
        }else{
            console.log("Transaction record creation failed");
            Alert.alert("Order Failed","Your order has failed," +
                " contact support with the following information, rfq_id "+rfq.metadata.exchangeId);
        }
        setLoading(false);
        router.push('/(tabs)/');

    }
    setLoading(false);

}

    const cancelQuote = async () => {
        //
        setLoading(true);
        const res =await fetch('http://138.197.89.72:3000/close', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exchangeId: rfq.metadata.exchangeId,
                pfiUri: rfq.metadata.to,
                customerDid: customerDid.did,
                reason:"User Cancelled"
            }),
        });
        //
        if (!res.ok) {
            throw new Error(`HTTP error! 2 status: ${res.status}`);
        }
        if (res.ok) {
            const data = {
                "wallet": wallet.id,
                "recepient": "",
                "external_address": `${rfq.metadata.to}`,
                "is_external": true,
                "description": "An external tbd recepient",
                "ref": `${rfq.metadata.exchangeId}`,
                "comment": "tbd transaction",
                "external_provider": "tbd",
                "status": "failed",
                "reason": "Send Money",
                "fees_charged": {amount:quote[1].data.payin.amount*0.035,currency:quote[1].data.payin.currencyCode},
            };

            const record = await pb.collection('transaction').create(data);
            const wallet_data = await pb.collection('wallet').getFirstListItem(`id = "${wallet.id}"`);
            const current_amount=wallet_data.balance;

            if(record){
                console.log("Transaction record created successfully");
                Alert.alert("You have cancelled this transaction","Your transaction has been cancelled successfully");
            }else{
                console.log("Transaction record creation failed");
                Alert.alert("Order Failed","Your order has failed," +
                    " contact support with the following information, rfq_id "+rfq.metadata.exchangeId);
            }
            setLoading(false);
            router.push('/(tabs)/');

        }
        setLoading(false);

    }

    return (
        <>
            {!showResponse ? (
                allCustomerVCs.length > 0 ? (
                    <>
                        <Text variant={"bodySmall"} style={{ marginBottom: 3 }}>Select A VC to Get A Quote</Text>
                        {allCustomerVCs.map((vc: any) => (
                            <Chip key={vc.id} icon="information" selected={selectedVC.id == vc.id} showSelectedCheck={true}
                                onPress={() => selectVC(vc)}>{vc.name}</Chip>
                        ))}
                        {selectedVC.id ? (
                            <Surface style={{ justifyContent: "center", alignItems: "flex-start", padding: 20, borderRadius: 10,marginTop:5 }}>
                                <Text variant={"titleSmall"}>The following Information Will Be Submitted:</Text>
                                {Object.keys(selectedVC.expand.issuer.verifiables).map((key) => {
                                    return (
                                        <Text key={key} variant={"bodyMedium"}>• {toSentenceCase(selectedVC.expand.issuer.verifiables[key])} has been verified</Text>
                                    );
                                })}
                                <Text variant={"bodyMedium"}>The Payment Information you have submitted will also be encrypted</Text>
                                <Button onPress={() => {
                                    fetchQuote();
                                }}>Get Quote</Button>
                            </Surface>
                        ) : <></>}
                    </>
                ) : (
                    <>
                        <Text variant={"bodyMedium"} style={{ marginBottom: 5 }}>No Credentials Found</Text>
                        <Chip icon="information" onPress={() => {
                            router.push('/Credentials/add_verifiable_credentials');
                        }}>Tap To Create</Chip>
                    </>
                )
            ) : (
                <>
                    <Text variant={"bodyMedium"}>Quote fetched successfully! {String(rfq?.metadata?.exchangeId)}</Text>
                    {/*{ console.log(quote)}*/}
                    <Surface elevation={3} style={{ flexDirection:"column",width:"100%",
                        marginVertical:20,
                        justifyContent: "center", alignItems: "center",
                        padding:5, borderRadius:10}}>
                        <Text variant={"titleMedium"}>Quote</Text>
                        <Text variant={"bodyMedium"}>You Send: {quote[1].data.payin.currencyCode}{" "}
                            {formatNumberWithCommas(quote[1].data.payin.amount)} </Text>
                        <Text variant={"bodyMedium"}>NexX facilitation fee: {quote[1].data.payin.currencyCode}{" "}
                            {formatNumberWithCommas(Math.round(quote[1].data.payin.amount*0.035))}</Text>
                        <Text variant={"bodyMedium"}>They Get: {quote[1].data.payout.currencyCode}{" "}
                            {formatNumberWithCommas(Math.round(quote[1].data.payout.amount))} </Text>
                        <Text variant={"bodyMedium"}>Total Spend: {quote[1].data.payin.currencyCode} {formatNumberWithCommas(Math.round(Number(quote[1].data.payin.amount)+ Number(quote[1].data.payin.amount*0.035)))} </Text>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginTop: 20,
                            backgroundColor: 'transparent',
                        }}>
                            <Button
                                style={{
                                    flex:1
                                }}
                                onPress={() => {
                                    confirmQuote();
                                }}
                                textColor={'gray'}
                            >Confirm</Button>




                            <Button
                                style={{
                                    flex:1
                                }}
                                textColor={'red'}
                                onPress={() => {
                                    cancelQuote()
                                }}>Cancel</Button>



                        </View>
                    </Surface>




                </>
            )}
        </>
    );
}