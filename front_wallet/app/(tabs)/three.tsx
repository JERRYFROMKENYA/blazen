// `app/(tabs)/three.tsx`
import {Image, StyleSheet} from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import React, {useEffect, useState} from 'react';
import CredentialsList from "@/components/CredentialsScreen/CredentialsList";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import ExplanationCard from "@/components/CredentialsScreen/ExplanationCard";
import { Appbar, FAB } from 'react-native-paper';
import {usePocketBase} from "@/components/Services/Pocketbase";
import {useAuth} from "@/app/(auth)/auth";
import {useRouter} from "expo-router";
import {useLoading} from "@/components/utils/LoadingContext";

export default function CredentialScreen() {
    const {setLoading}=useLoading();
    const router =useRouter();
    // const _handleSearch = () => console.log('Searching');
    // const _handleMore = () => console.log('Shown more');
    const {pb}=usePocketBase();
    const{user}=useAuth();
    const [vcList,setVcList]=useState([]);
    async function getVCList() {
        const resultList = await pb.collection('customer_vc').getFullList({
            filter: `user = "${user.id}"`,expand:"issuer"
        })

        setVcList(resultList)
        // console.log(resultList)
    }
    useEffect(()=>{
        setLoading(true);
        getVCList().then(r => {

        })
        setLoading(false)
    },[user])

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="Verifiable Credentials" />
                {/*<Appbar.Action icon="magnify" onPress={_handleSearch} />*/}
                {/*<Appbar.Action icon="dots-vertical" onPress={_handleMore} />*/}
            </Appbar.Header>
            <SafeScreen onRefresh={()=>{
                getVCList().then(r => {})
            }}>
                <ExplanationCard/>
                <CredentialsList
                    refresh={getVCList}
                    vcList={vcList} />

            </SafeScreen>
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() =>router.push('/Credentials/add_verifiable_credentials' )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});