import JSZip from "jszip";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import React, { useEffect, useState } from "react";
import { Appbar, Button, Card, Icon, Surface, Text } from "react-native-paper";
import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { Alert, ImageSourcePropType, Linking } from "react-native";
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { fetchDHT, storeUserDID } from "@/components/utils/did_operations";

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

        const fileUri = FileSystem.documentDirectory + 'portable_did.json';
        const zipUri = FileSystem.documentDirectory + 'portable_did.zip';
        const fileName = 'portable_did' + uri.slice(-12, -1) + '.json';
        const zipName = 'portable_did' + uri.slice(-12, -1) + '.zip';
        const description = 'Exported DID file';
        const fileContent = JSON.stringify(did.did);

        try {
            // Check if the file already exists in the collection
            const existingFile = await pb.collection('files_').getFirstListItem(`filename = "${zipName}"`);
            if (existingFile) {
                alert('File already exists. Redirecting to download...');
                const downloadUrl = `${pb.baseUrl}api/files_/${existingFile.id}`;
                Linking.openURL(downloadUrl);
                return;
            }
        } catch (error) {
            // console.error('Error checking existing file:', error);
        }

        try {
            // Write the file to the local filesystem
            await FileSystem.writeAsStringAsync(fileUri, fileContent, { encoding: FileSystem.EncodingType.UTF8 });

            // Read the file back from the local filesystem
            const fileData = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });

            // Create a zip file
            const zip = new JSZip();
            zip.file(fileName, fileData);
            const zipContent = await zip.generateAsync({ type: "blob" });

            // Log the zip content
            console.log(zipContent);

            // Write the zip file to the local filesystem
            await FileSystem.writeAsStringAsync(zipUri, zipContent, { encoding: FileSystem.EncodingType.Base64 });

            // Read the zip file back from the local filesystem
            const zipData = await FileSystem.readAsStringAsync(zipUri, { encoding: FileSystem.EncodingType.Base64 });

            // Create a Blob from the zip data
            const content = new File([zipData], zipName, { type: 'application/zip' });

            // Upload the zip file to the collection
            const formData = new FormData();
            formData.append('filename', zipName);
            formData.append('field', content,zipName);
            formData.append('description', description);

            await pb.collection('files_').create(formData);
            alert('DID exported and uploaded successfully.');

            // Redirect the user to download the file
            const downloadUrl = `${pb.baseUrl}api/files_/${zipName}`;
            Linking.openURL(downloadUrl);
        } catch (error) {
            // console.error('Error uploading file:', error);
            alert('Failed to upload the file.');
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

                    <Appbar.Action icon={"file-import"} onPress={() => { setImportMode(!importMode) }} />
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

                </SafeScreen>
            </View>
        </>
    )
}