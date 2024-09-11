import { useEffect, useState } from "react";
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { Button, Chip, Surface, Text } from "react-native-paper";
import React from "react";
import { useRouter } from "expo-router";

export default function GetQuote({ paymentDetails, setShowQuote, offering, amount }: { paymentDetails: any, showQuote: boolean, setShowQuote: Function, offering: any, amount: string }) {
    const router = useRouter();

    const { pb } = usePocketBase();
    const { user } = useAuth();
    const [kcc, setKcc] = useState("");
    const [customerDid, setCustomerDid] = useState({});
    const [allCustomerVCs, setAllCustomerVCs] = useState([]);
    const [selectedVC, setSelectedVC] = useState({});
    const [showResponse, setShowResponse] = useState(false);
    const [response, setResponse] = useState({});

    const toSentenceCase = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const refreshData = async () => {
        const kcc = await pb.collection('customer_vc').getFullList({ filter: `user = "${user.id}"`, expand: "issuer" });
        setAllCustomerVCs(kcc);

        const customerDid = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`);
        setCustomerDid(customerDid);
    };

    useEffect(() => {
        refreshData();
    }, [router]);

    const selectVC = (vc: any) => {
        setSelectedVC(vc);
    };

    const fetchQuote = async () => {

        const bodyData = {
            payoutPaymentDetails: paymentDetails,
            offering: offering,
            amount: amount,
            customerCredentials: selectedVC.vc,
            customerDid: customerDid.did
        };
        console.log(bodyData);

        try {
            const response = await fetch('http://138.197.89.72:3000/offerings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });
            setShowResponse(true);
            setResponse(await response.json());


        } catch (e) {
            console.error(e);
        }
    };

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
                            <Surface style={{ justifyContent: "center", alignItems: "flex-start", padding: 20, borderRadius: 10 }}>
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
                    <Text variant={"bodyMedium"}>Quote fetched successfully! {String(response)}</Text>
                    { console.log(response)}
                    <Button onPress={() => setShowResponse(false)}>Back</Button>
                </>
            )}
        </>
    );
}