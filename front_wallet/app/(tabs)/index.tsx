import React, { useEffect, useState } from 'react';
import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { BalanceCard, QuickActions, TransactionsWidget } from "@/components/Home";
import {Platform, View, StyleSheet, Image, TouchableOpacity, ImageSourcePropType} from "react-native";
import {Appbar, Button, Card, Text} from "react-native-paper";
import { useAuth } from "@/app/(auth)/auth";
import PocketBase from "pocketbase";
import { useRouter } from "expo-router";
import {useLoading} from "@/components/utils/LoadingContext";
import WalletCards from "@/components/Home/WalletCards/WalletCards";

interface User {
  name: string;
  avatar: string;
}

export default function Home() {
  const IsiOS=Platform.OS==="ios";
  const router = useRouter();
  const pocketbase = new PocketBase('http://138.197.89.72:8090');
  const { user, refreshAuth } = useAuth();
  const [name, setName] = useState("loading...");
  const [avatar, setAvatar] = useState("https://api.dicebear.com/9.x/pixel-art/jpg?seed="+user.username);
  const { setLoading } = useLoading();

  const ChartWidget=()=>{
    return(
        <>

        </>
    )
  }



  const PFIExplanation = () => {
    const privacyShieldImage: ImageSourcePropType = require('@/assets/images/pfi.png');
    const [hidden, setHidden] = React.useState(false);
    console.log(hidden)
    return (
        !hidden && (
            <Card style={{ marginVertical: 10, width:"95%", alignSelf:"center" }}>

              <Card.Content>
                <Text variant="bodyMedium" style={{ marginBottom: 5, marginTop: 5 }}>
                  {"What is a PFI?"}
                </Text>
                <Text variant="bodySmall">
                  {"PFIs are Participating Financial Institutions that offer liquidity on a tbDEX network.\n" +
                      "\n" +
                      "PFIs make themselves known to Wallet applications and" +
                      " engage in verifying necessary information for" +
                      " transaction completion with Verifiable Credential Issuers."}
                </Text>
              </Card.Content>
              {/*<Card.Cover style={{ marginTop:20,width: "100%" }} source={privacyShieldImage} />*/}
                <Card.Actions>
                  <Button onPress={()=>{router.push("/all-pfis/all-pfis")}} mode={"text"}>See PFIs on NexX {'→'}</Button>
                </Card.Actions>

            </Card>
        )
    );
  };


  useEffect(() => {
    setLoading(true);
    setName((user as User)?.username ?? "");
    if ((user as User)?.avatar) {
      setAvatar(pocketbase.getFileUrl(user, user?.avatar));
    }
    // console.log(avatar);
    setLoading(false);
  }, [user,router]);

  const handleRefresh = async () => {
    router.replace("/(tabs)/");
  };

  return (
      user && (<View style={styles.container}>
    <SafeScreen onRefresh={handleRefresh}>
      {!IsiOS&&<Appbar.Header style={styles.header}>
        <Text variant={"headlineMedium"} style={styles.greeting}>
          Hi, {name}
        </Text>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => {
            router.push({pathname: "/Profile/Profile"})
          }}>
            <Image source={{uri: avatar}} style={styles.avatar}/>
          </TouchableOpacity>
        </View>
      </Appbar.Header>}
      {IsiOS&&<View style={styles.header}>
        <Text variant={"headlineMedium"} style={styles.greeting}>
          Hi, {name}
        </Text>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => {
            router.push({pathname: "/Profile/Profile"})
          }}>
            <Image source={{uri: avatar}} style={styles.avatar}/>
          </TouchableOpacity>
        </View>
      </View>}
      {/* Start Balance Card */}
      <BalanceCard/>
      {/* End Balance Card */}
      {/* Start Action Tray */}
      <QuickActions/>
      {/* End Action Tray */}
      {/*PFI Explanation*/}
      <PFIExplanation/>
      {/*End*/}
      {/* Start Activity Tray */}
      <TransactionsWidget/>
      {/* End Activity Tray */}

    </SafeScreen>
  </View>)

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor:"transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin:15
  },
  greeting: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  avatarContainer: {
    height: 54,
    width: 54,
    borderRadius: 27,
    overflow: 'hidden',
    marginLeft: 10,
    margin: 20,
    borderColor:"purple",
    borderWidth:5,
  },
  avatar: {
    height: '100%',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});