import React, { useState } from 'react';
import { usePocketBase } from '@/components/Services/Pocketbase';
import { useAuth } from '@/app/(auth)/auth';
import { Image, View, Share } from 'react-native';
import { Text, Button, Modal, Portal, Surface } from 'react-native-paper';
import CredentialsCard from '@/components/CredentialsScreen/CredentialsCard';
import { useRouter } from "expo-router";
import QRCode from 'react-native-qrcode-svg';

const CredentialsList: React.FC<{ vcList: any[], refresh: Function }> = ({ vcList, refresh }) => {
    const { pb } = usePocketBase();
    const { user } = useAuth();
    const router = useRouter();
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedVc, setSelectedVc] = useState(null);

    const onDelete = async (id: string) => {
        const deleted_record = await pb.collection('customer_vc').delete(id);
        console.log(deleted_record);
    }

    const exportVc = async (vc: any) => {
        try {
            await Share.share({
                title: 'Exported Credential',
                message: `
                ----START----
                ${JSON.stringify(vc)}
                ----END----
                `,
            });
        } catch (error) {
            alert('Failed to export the credential.');
        }
    };

    const showQrCode = (vc: any) => {
        setSelectedVc(vc);
        setQrModalVisible(true);
    };

    return (
        <View style={{ marginBottom: 120 }}>
            {vcList.length === 0 && <View style={{ alignItems: "center", padding: 20 }}><Text>No credentials found</Text></View>}
            {vcList.map((vc: any) => (
                <CredentialsCard
                    key={vc.id}
                    dateIssued={vc.created}
                    issuer={vc.expand.issuer.name}
                    properties={vc.expand.issuer.verifiables}
                    purpose={vc.purpose}
                    vc={vc.vc}
                    onDelete={() => {
                        onDelete(vc.id);
                        refresh();
                    }}
                    exportVc={() => exportVc(vc)}
                    showQrCode={() => showQrCode(vc)}
                >
                    <Button onPress={() => exportVc(vc)}>Export</Button>
                    <Button onPress={() => showQrCode(vc)}>Show QR Code</Button>
                </CredentialsCard>
            ))}
            <Image
                source={require('@/assets/images/adaptive-icon.png')}
                style={{ width: 200, height: 50, margin: 20, alignSelf: "center" }}
            />
            <Portal>
                <Modal visible={qrModalVisible} onDismiss={() => setQrModalVisible(false)} contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Surface style={{ padding: 20, alignItems: 'center' }}>
                        {selectedVc && <QRCode value={JSON.stringify(selectedVc)} size={300} />}
                        <Button onPress={() => setQrModalVisible(false)} style={{ marginTop: 20 }}>Close</Button>
                    </Surface>
                </Modal>
            </Portal>
        </View>
    );
}

export default CredentialsList;