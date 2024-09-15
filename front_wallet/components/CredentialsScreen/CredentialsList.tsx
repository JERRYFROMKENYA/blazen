import React, { useEffect, useState } from 'react';
import { usePocketBase } from '@/components/Services/Pocketbase';
import { useAuth } from '@/app/(auth)/auth';
import {Image, View} from 'react-native';
import { Text } from '@/components/Themed';
import CredentialsCard from '@/components/CredentialsScreen/CredentialsCard';
import {useRouter} from "expo-router";

const CredentialsList: React.FC<{ vcList: any[],refresh:Function }> = ({ vcList,refresh }) => {
    const { pb } = usePocketBase();
    const { user } = useAuth();
    const router = useRouter();

    const onDelete = async (id: string) => {
        const deleted_record = await pb.collection('customer_vc').delete(id);
        console.log(deleted_record);
    }

    return (
        <View style={{marginBottom:120}}>
            {vcList.length === 0 && <View style={{ alignItems:"center",padding: 20 }}><Text>No credentials found</Text></View>}
            {vcList.map((vc: any) => (
                <CredentialsCard
                    key={vc.id}
                    dateIssued={vc.created}
                    issuer={vc.expand.issuer.name}
                    properties={vc.expand.issuer.verifiables}
                    purpose={vc.purpose}
                    vc={vc.vc}
                    onDelete={() => {
                        onDelete(vc.id)
                        refresh()
                    }}
                />
            ))}
            <Image
                source={require('@/assets/images/adaptive-icon.png')}
                style={{ width: 200, height: 50, margin: 20, alignSelf:"center" }}
            />
        </View>
    );
}

export default CredentialsList;