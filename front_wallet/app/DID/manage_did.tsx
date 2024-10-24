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
import {uploadFiles} from "@/components/utils";
// require("dotenv").config();

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
            <Card style={{ marginVertical: 10, width:"95%", alignSelf:"center" }}>

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
                <Card.Cover style={{ width: "100%" , marginTop:10}} source={privacyShieldImage} />
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
        try {
            // Define file path
            const fileUri = FileSystem.documentDirectory + 'portable_did.json';

            // Write DID data to the file
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(did.did), { encoding: FileSystem.EncodingType.UTF8 });

            // Read the file as a URI (don't use readAsStringAsync, it's not necessary for file uploads)
            const file = {
                uri: fileUri,                // File URI
                name: 'portable_did.json',    // Name of the file
                type: 'application/json',     // MIME type of the file
            };

            // Upload the file using the uploadFiles function
            const file_name= await uploadFiles(user, [file], "DID export", "portable_did")
                // .files[0].replace("pocketbase",process.env.POCKETBASE_URL as string);
            // console.log("file_name:",file_name);
            const url = file_name.files[0].replace("pocketbase","138.197.89.72");
            // Alert user of success
            Alert.alert( "Success",
                "DID successfully exported and uploaded as a file.",
                [
                    { text: "OK", onPress: () => {
                        Linking.openURL(url);
                        } }
                ]
            );
        } catch (error) {
            console.error('Error exporting DID:', error);
            Alert.alert('Error', 'Failed to export DID');
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

                    <Surface elevation={2} style={{
                        width: "95%",
                        padding: 30,
                        marginBottom: 10,
                        flexDirection: "column", borderRadius: 20,
                        justifyContent: "space-between", alignItems: "center",
                        marginTop:20,
                        alignSelf:"center"
                    }}>
                        <Text variant={"titleSmall"}>DID: Decentralized Identifier</Text>
                        <Text variant={"titleSmall"} style={{ margin: 5 }}> {uri || "loading ..."}</Text>
                        <View style={{ justifyContent: "flex-end", alignContent: "space-between", flexDirection: "row", backgroundColor: "transparent", margin: 5 }}>
                            <Text style={{ flex: 1, alignSelf: "flex-start" }} onPress={exportDidToJson} variant={"titleSmall"}>Export</Text>
                            <Text style={{ alignSelf: "flex-end", color: "gray" }} variant={"titleSmall"} onPress={handleRegenerate}>Regenerate</Text>
                        </View>
                    </Surface>
                    <ExplanationCard />
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


