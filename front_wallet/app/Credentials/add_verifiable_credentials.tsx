// `app/Credentials/add_verifiable_credentials.tsx`
import {StyleSheet, FlatList, TouchableOpacity, Alert} from 'react-native';
import { Text, View } from '@/components/Themed';
import React, { useEffect, useState } from 'react';
import { Appbar, Searchbar, List } from 'react-native-paper';
import { usePocketBase } from '@/components/Services/Pocketbase';
import { useAuth } from '@/app/(auth)/auth';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import {fetchVCIssuerURLById, requestVC} from "@/components/utils/vc_operations";
import {useRouter} from "expo-router";
import {useLoading} from "@/components/utils/LoadingContext";

export default function AddVerifiableCredential() {
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [vcList, setVcList] = useState([]);
    const { pb } = usePocketBase();
    const { user } = useAuth();
    const {setLoading} = useLoading();

    const _handleSearch = () => setShowSearch(!showSearch);

    async function getVCList() {
        const resultList = await pb.collection('vc_issuer').getFullList();
        setVcList(resultList);
    }

    useEffect(() => {
        setLoading(true);
        getVCList();
        setLoading(false);
    }, [user, pb]);

    const toSentenceCase = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    async function searchVCList() {
        if (searchQuery.trim() === '') {
            const resultList = await pb.collection('vc_issuer').getFullList();
            setVcList(resultList);
        } else {
            const resultList = await pb.collection('vc_issuer').getList(1, 50, {
                filter: `name ?~ "%${searchQuery}%" || description ?~ "%${searchQuery}%" || verifiables ?~ "%${searchQuery}%"`,
            });
            setVcList(resultList);
        }
    }

   const handlePress = async (issuer: {}, data: any) => {
    Alert.alert(
        "Do you want to create a VC using this provider?",
        `By Continuing you agree to submit the following data : ${Object.keys(data).map((key) => (
            `Your ${toSentenceCase(data[key])} `
        ))}`,
        [
            {
                text: "Cancel",
                onPress: () => console.log("VC creation cancelled"),
                style: "cancel"
            },
            {
                text: "OK",
                onPress: async () => {
                    setLoading(true);
                    try {

                        const vc_initial = await pb.collection('customer_vc').getFirstListItem(`issuer="${issuer.id}" && user="${user.id}"`);
                        if (vc_initial) {
                            Alert.alert("Error", 'You already have a VC from this issuer');
                            setLoading(false);
                           router.push('/(tabs)/three');
                            return;
                        }

                    } catch (error) {

                        // console.error("Error creating VC:", error);
                        console.log(issuer.id);
                        const URL = await fetchVCIssuerURLById(pb, issuer.id);
                        const response = await pb.collection('customer_did').getFirstListItem(`user="${user.id}"`);
                        console.log(response.did);
                        const userDid = response.did.uri;
                        if (!URL) {
                            Alert.alert("Error", 'Error fetching VC Issuer URL');
                            return;
                        }
                        if (!userDid) {
                            Alert.alert("Error", 'Error fetching User DID');
                            return;
                        }
                        if (!user) {
                            Alert.alert("Error", 'Error fetching User data');
                            return;
                        }
                        const name = user.first_name+" "+user.middle_name+" "+user.last_name;
                        const vc = await requestVC(URL, name, user.country, userDid);
                        console.log(vc)
                        if(vc){
                            const data = {
                                "user": user.id,
                                "name": issuer.name,
                                "purpose": "Verification",
                                "issuer": issuer.id,
                                vc
                            };

                            const record = await pb.collection('customer_vc').create(data);
                            setLoading(false)
                            router.push('/(tabs)/three');
                        }
                        else {
                            Alert.alert("Error", 'Error fetching VC');
                            setLoading(false)
                           router.push('/(tabs)/three');
                        }
                    }
                }
            }
        ]
    );
};

    const SearchBarComponent = () => (
        <Searchbar
            mode="bar"
            placeholder="Search VC Providers"
            onChangeText={async (t) => {
                setSearchQuery(t);
                searchVCList();
            }}
            value={searchQuery}
        />
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => console.log(`Clicked on ${item.name}`)}>
            <View style={styles.item}>
                <Text>{item.name}</Text>
                <Text>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Action icon={"close"} onPress={()=>{router.back()}}/>
                <Appbar.Content title="Create Verifiable Credentials" />
                <Appbar.Action icon={showSearch?"close":"magnify"} onPress={_handleSearch} />
            </Appbar.Header>
            <SafeScreen onRefresh={() => {}}>
                {showSearch && <SearchBarComponent />}
                {Array.isArray(vcList) && vcList.length === 0 && <Text>No VC Providers found</Text>}
                {Array.isArray(vcList) && vcList.map((vc) => (
                    <React.Fragment key={vc.id}>
                        <List.Item
                            title={vc.name}
                            description={`${vc.description} \n Verifies: ${Object.keys(vc.verifiables).map((key) => (
                                `${toSentenceCase(vc.verifiables[key])} `
                            ))}`}
                            onPress={()=>{handlePress(vc,vc.verifiables)}}
                        />
                        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                    </React.Fragment>
                ))}
            </SafeScreen>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    separator: {
        marginVertical: 5,
        height: 1,
        width: '100%',
    },
});