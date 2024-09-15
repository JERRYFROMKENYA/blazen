import JSZip from "jszip";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import React, { useEffect, useState } from "react";
import {Appbar, Button, Card, Icon, Modal, Portal, Surface, Text} from "react-native-paper";
import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import {Alert, ImageSourcePropType, Linking, Share} from "react-native";
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { fetchDHT, storeUserDID } from "@/components/utils/did_operations";
import QRCode from "react-native-qrcode-svg";

const privacyShieldImage: ImageSourcePropType = require('@/assets/images/tech_woman.png');

interface Did {
    id: string;
    did: {
        uri: string;
    };
}

const ExplanationCard = () => {
    const [hidden, setHidden] = React.useState(false);
    console.log(hidden)
    return (
        !hidden && (
            <Card style={{ marginVertical: 10 }}>
                <Card.Cover style={{ width: "100%" }} source={privacyShieldImage} />
                <Card.Content>
                    <Text variant="bodyMedium" style={{ marginBottom: 5, marginTop: 5 }}>
                        {"What is a Decentralized Identifier?"}
                    </Text>
                    <Text variant="bodySmall">
                        {"A DID is an address representing who you are on the decentralized web. " +
                            "It can point to a person, organization, thing, data model, or abstract entity. " +
                            "It's through your DID that others can send messages and data," +
                            " and be granted access to information you wish to share."}
                    </Text>
                </Card.Content>
                <Card.Actions>
                    <Button
                        style={{ alignSelf: "flex-end" }}
                        icon={() => <Icon size={20} source={"close"} />}
                        onPress={() => setHidden(!hidden)}
                    >
                        {"Close"}
                    </Button>
                </Card.Actions>

            </Card>
        )
    );
};

export default function ManageDid() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { pb } = usePocketBase();
    const [did, setDid] = useState<Did | null>(null);
    const [uri, setUri] = useState("loading...");
    const [importMode, setImportMode] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);

    const getDid = async () => {
        const did = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`) as Did;
        setDid(did);
        setUri(did.did.uri);
        console.log(did.did.uri);
    }

    useEffect(() => {
        getDid().then(r => r);
        console.log(user);
    }, [user]);

    const exportDidToJson = async () => {
        if (!did) return;

        try {
            await Share.share({
                title: 'Exported DID',
                message: `
                **Be careful with this information. Anyone with this DID can impersonate you.**
                -----START DID-----
                ${JSON.stringify(did.did)}
                -----END DID-----
                **Be careful with this information. Anyone with this DID can impersonate you.**
                
                `,
            });
        } catch (error) {
            alert('Failed to export the DID.');
        }
    };

    const handleRegenerate = async () => {
        if (!did) return;

        Alert.alert(
            "Confirm Regeneration",
            "Are you sure you want to regenerate your DID? " +
            "Only do this if your private keys have been compromised. " +
            "This action will also reset your VCs and terminate any pending transactions",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: async () => {
                        await pb.collection('customer_did').delete(did.id);
                        const records = await pb.collection('customer_vc').getFullList({
                            sort: '-created',
                        });
                        for (const record of records) {
                            await pb.collection('customer_vc').delete(record.id);
                        }

                        const new_did = await fetchDHT();
                        if (await storeUserDID(user, pb, new_did, "dht")) {
                            Alert.alert("New DID", "A new DID has been generated");
                            getDid();
                        }
                    }
                }
            ]
        );
    };

    const handleImport = () => {

    }

    return (
        <>
            <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>

                <Appbar.Header>
                    <Appbar.Action icon={"arrow-left"} onPress={() => { router.back() }} />
                    <Appbar.Content title="Manage DID" />

                    <Appbar.Action icon={"qrcode"} onPress={() => { setQrModalVisible(true) }} />
                </Appbar.Header>
                <SafeScreen onRefresh={() => { }}>
                    <ExplanationCard />
                    <Surface elevation={2} style={{
                        width: "100%",
                        padding: 30,
                        marginBottom: 10,
                        flexDirection: "column", borderRadius: 20,
                        justifyContent: "space-between", alignItems: "center"
                    }}>
                        <Text variant={"titleSmall"}>DID: Decentralized Identifier</Text>
                        <Text variant={"titleSmall"} style={{ margin: 5 }}> {uri || "loading ..."}</Text>
                        <View style={{ justifyContent: "flex-end", alignContent: "space-between", flexDirection: "row", backgroundColor: "transparent", margin: 5 }}>
                            <Text style={{ flex: 1, alignSelf: "flex-start" }} onPress={exportDidToJson} variant={"titleSmall"}>Export</Text>
                            <Text style={{ alignSelf: "flex-end", color: "gray" }} variant={"titleSmall"} onPress={handleRegenerate}>Regenerate</Text>
                        </View>
                    </Surface>
                    <Portal>
                        <Modal visible={qrModalVisible} onDismiss={() => setQrModalVisible(false)} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Surface style={{ padding: 20, alignItems: 'center' }}>
                                <QRCode value={`${uri}`} size={200} />
                                <Button onPress={() => setQrModalVisible(false)} style={{ marginTop: 20 }}>Close</Button>
                            </Surface>
                        </Modal>
                    </Portal>

                </SafeScreen>
            </View>
        </>
    )
}


