import React, { useEffect, useState } from 'react';
import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { BalanceCard, QuickActions, TransactionsWidget } from "@/components/Home";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { useAuth } from "@/app/(auth)/auth";
import PocketBase from "pocketbase";
import { useRouter } from "expo-router";

interface User {
  name: string;
  avatar: string;
}

export default function Home() {
  const router = useRouter();
  const pocketbase = new PocketBase('http://138.197.89.72:8090');
  const { user, refreshAuth } = useAuth();
  const [name, setName] = useState("loading...");
  const [avatar, setAvatar] = useState("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQimIXWmgpyuYaqMRDE3BdO183iSVJ_T2JUNg&s");

  useEffect(() => {
    setName((user as User)?.name ?? "");
    if ((user as User)?.avatar) {
      setAvatar(pocketbase.getFileUrl(user, user?.avatar));
    }
    console.log(avatar);
  }, [user]);

  const handleRefresh = async () => {
    router.replace("/(tabs)/");
  };

  return (
    <View style={styles.container}>
      <SafeScreen onRefresh={handleRefresh}>
        <View style={styles.header}>
          <Text variant={"displaySmall"} style={styles.greeting}>
            Hi, {name}
          </Text>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={() => { router.push({ pathname: "/Profile/Profile" }) }}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Balance Card */}
        <BalanceCard />
        {/* End Balance Card */}
        {/* Start Action Tray */}
        <QuickActions />
        {/* End Action Tray */}
        {/* Start Activity Tray */}
        <TransactionsWidget />
        {/* End Activity Tray */}
      </SafeScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  avatarContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginLeft: 10,
    margin: 20,
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