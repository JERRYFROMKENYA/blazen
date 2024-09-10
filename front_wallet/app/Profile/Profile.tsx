import SafeScreen from "@/components/SafeScreen/SafeScreen";
import React, {useState} from "react";
import {Appbar, Avatar, Text, Surface, Button, List} from "react-native-paper";
import {View} from "@/components/Themed";
import { TouchableOpacity, Linking } from "react-native";
import {useAuth} from "@/app/(auth)/auth";
import {useEffect} from "react";
import {usePocketBase} from "@/components/Services/Pocketbase";
import * as FileSystem from 'expo-file-system';
import {useRouter} from "expo-router";


interface User {
    name: string;
    avatar: string;
}

export default function Profile() {
    const router =useRouter();
    const [avatar, setAvatar] = useState("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQimIXWmgpyuYaqMRDE3BdO183iSVJ_T2JUNg&s");
    const {user, signOut}=useAuth();
    const {pb}=usePocketBase();
    const [did, setDid] = useState("loading...");
    const [name, setName]=useState("loading...");
    const getDid = async () => {
        const did = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`);
        setDid(did.did);
        console.log(did);
    }
    useEffect(() => {
       getDid().then(r => r);
        if ((user as User)?.avatar) {
            setAvatar(pb.getFileUrl(user, user?.avatar));
        }
        console.log(user);
        setName((user.first_name + " "+user.middle_name + " "+user.last_name||" "))
        console.log(avatar);
    }, [user]);

    const exportDidToJson = async () => {
        const fileUri = FileSystem.documentDirectory + 'portable_did.json';
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(did), { encoding: FileSystem.EncodingType.UTF8 });
        alert(`DID exported to ${FileSystem.documentDirectory}/portable_did.json`);
    };

    const handleLearnMore = () => {
        Linking.openURL('https://example.com/learn-more');
    };
    const handleSignOut =()=>{
        // sign out
        signOut();
        router.replace('/(auth)/login')
    }

    return (
    <View style={{height:"100%"}}>
        <Appbar.Header>
            <Appbar.Action icon={"arrow-left"} onPress={()=>{router.back()}}/>
            <Appbar.Content title="My NexX Account" />
        </Appbar.Header>
        <SafeScreen onRefresh={()=>{}}>
            <Surface elevation={0} style={{width:"100%",
                padding:30,
                marginBottom:10,
                flexDirection:"column",borderRadius:20,
                justifyContent:"space-between",alignItems:"center"}}>
                <Avatar.Image size={100} source={{uri:avatar}} style={{marginBottom:20}} />
                <Text variant={"bodySmall"}>Full Name: {name}</Text>
                <Text variant={"displaySmall"}>{user.name}</Text>
                <Text variant={"bodyMedium"}>NexX Username: {user.username}</Text>
                <Text style={{alignSelf:"flex-end", justifyContent:"flex-end",marginTop:10}} variant={"bodySmall"}>Member Since:{"2024"}</Text>
            </Surface>
            <Surface elevation={2} style={{width:"100%",
                padding:30,
                marginBottom:10,
                flexDirection:"column",borderRadius:20,
                justifyContent:"space-between",alignItems:"center"}}>
                <Text variant={"titleSmall"}>DID: Decentralized Identifier</Text>
                <Text variant={"titleSmall"} style={{margin:5}}> {did.uri||"loading ..."}</Text>
                <View style={{justifyContent:"flex-end",alignContent:"space-between",flexDirection:"row",backgroundColor:"transparent", margin:5}}>
                    <Text style={{flex:1,alignSelf:"flex-start"}} onPress={()=>{router.push('/DID/manage_did')}} variant={"titleSmall"}>Manage</Text>
                    <Text style={{alignSelf:"flex-end", color:"gray"}} variant={"titleSmall"} onPress={handleLearnMore}>Learn More</Text>
                </View>
            </Surface>

            <Surface elevation={1} style={{width:"100%",
                padding:5,
                marginBottom:10,
                flexDirection:"column",borderRadius:5,
                justifyContent:"space-between",alignItems:"center"}}>
                <List.Item
                    title="Profile"
                    description="Change your Profile Picture and Nickname"
                    left={props => <List.Icon {...props} icon="account-circle-outline" />}
                />
                <List.Item
                    title="Security"
                    description="Setup Authentication and Security"
                    left={props => <List.Icon {...props} icon="account-lock" />}
                />
                <List.Item
                    title="Password"
                    description="Change Your Password"
                    left={props => <List.Icon {...props} icon="form-textbox-password" />}
                />
                <List.Item
                    title="Support"
                    description="Contact Us, Privacy Policy, Terms of Service"
                    left={props => <List.Icon {...props} icon="comment-text-multiple" />}
                />

            </Surface>

            <Surface elevation={3} style={{width:"100%",
                padding:30,
                marginBottom:10,
                flexDirection:"column",borderRadius:20,
                justifyContent:"space-between",alignItems:"center"}}>
                <Button mode={"outlined"} style={{color:"red"}} onPress={handleSignOut}>Sign Out</Button>
                <Button mode={"elevated"} style={{margin:5,backgroundColor:"maroon"}} textColor={"white"}> Delete NexX Account</Button>
            </Surface>
            <Surface elevation={0} style={{width:"100%",
                padding:5,
                marginBottom:150,
                flexDirection:"column",borderRadius:20,
                justifyContent:"space-between",alignItems:"center"}}>
                <Text variant={"bodySmall"}>©️ 2024 NexX, powered by tbDex</Text>
            </Surface>

        </SafeScreen>
    </View>
    );
}