import React from 'react';
import {  StyleSheet } from 'react-native';
import { Button, Appbar } from 'react-native-paper';
import {View} from "@/components/Themed";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import {useRouter} from "expo-router";

const MainScreen = () => {
  const router =useRouter();

  return (
    <View>
      <Appbar.Header>
        <Appbar.Action icon={"arrow-left"} onPress={()=>router.back()}/>
        <Appbar.Content title="Bill Split" />
      </Appbar.Header>
      <SafeScreen>
        <View style={styles.buttonContainer}>
        <Button style={{margin:10}} mode="contained" onPress={() => router.push('/split_bill/BillCreation')}>
          Create Bill
        </Button>
        <Button style={{margin:10}} mode="contained" onPress={() => router.push('/split_bill/JoinBill')}>
          Join Bill
        </Button>
        <Button style={{margin:10}} mode="contained" onPress={() => router.push('/split_bill/ManageBills')}>
          Manage Bills
        </Button>
    </View>

      </SafeScreen>
  </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    justifyContent:"center",
    alignItems:"center"
  },
});

export default MainScreen;
