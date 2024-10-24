import React, {useEffect} from "react";
import {View} from "@/components/Themed"
import {Appbar, Button, Card, Icon, MD3Colors, Text, List, Surface, Divider} from "react-native-paper";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import {ImageSourcePropType} from "react-native";
import {useAuth} from "@/app/(auth)/auth";
import {usePocketBase} from "@/components/Services/Pocketbase";
import {useRouter} from "expo-router";
import {useLoading} from "@/components/utils/LoadingContext";
import {codeToCurrency} from "@/components/utils";


export default function AllPfis() {
    const router = useRouter()
    const [allowListedPFis, setAllowListedPFis] = React.useState(false);
    const {user} = useAuth();
    const {pb} =usePocketBase()
    const {setLoading}= useLoading()

    const getAllowListedPFis = async () => {
        const pfis = await pb.collection('pfi').getFullList()

        setAllowListedPFis(pfis);
        console.log("PFIS: ",pfis);
    }

    useEffect(() => {
        setLoading(true)
        getAllowListedPFis().then(()=>setLoading(false))
    }, [user,router]);






    const ExplanationCard = () => {
        const pfiImage: ImageSourcePropType = require('@/assets/images/pfi.png');
        const [hidden, setHidden] = React.useState(false);
        console.log(hidden)
        return (
            !hidden && (
                <Card style={{ marginBottom: 30 , width:"95%", alignSelf:"center", margin:30}}>

                    <Card.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 5, marginTop: 5 }}>
                            {"What is a PFI (Participating Financial Institution?"}
                        </Text>
                        <Text variant="bodySmall">
                            {"In the NexX wallet, PFIs (Participating Financial Institutions) play a crucial role."+
                                "Think of them as trusted financial partners who provide liquidity—this means they ensure there is enough money available for users to complete transactions smoothly."+
                                "They help verify important information about users and the transactions being made, using Verifiable Credentials (VCs) to confirm details in a secure way."+
                                "By connecting to PFIs, NexX allows users to transfer money, exchange currencies, and even invest their savings, all while ensuring the process is trustworthy."+
                                "Essentially, PFIs help make sure every transaction within the NexX wallet happens safely and efficiently,"+
                                "which is why they are vital to its operation."}
                        </Text>
                    </Card.Content>
                    <Card.Cover style={{ width: "100%", marginTop:10 }} source={pfiImage} />

                </Card>
            )
        );
    };
    return(
        <View>
            <Appbar.Header>
                <Appbar.BackAction onPress={()=>{router.back()}}/>
                <Appbar.Content title={"Participating Financial Institutions"}/>
            </Appbar.Header>
            <SafeScreen onRefresh={getAllowListedPFis}>
                <Surface elevation={0} style={{width:"90%",alignSelf:"center" }}>
                    <List.Section>
                        <List.Subheader> PFIs On NexX</List.Subheader>
                        {allowListedPFis && allowListedPFis.map((pfi)=> <><List.Item
                            key={pfi.id}
                            title={pfi.name}
                            descriptionNumberOfLines={5}
                            descriptionStyle={{fontSize:10}}
                            onPress={()=>{router.push(`pfi-details/${pfi.did}`)}}
                            description={pfi.description}
                            left={() => <List.Icon icon="bank-outline" />} />
                        <Divider key={pfi.id+"j"} bold/>
                        </>)}


                    </List.Section>
                </Surface>


                <ExplanationCard/>
            </SafeScreen>

        </View>
    )

}