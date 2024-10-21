import {View} from "@/components/Themed"
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import {Appbar, Text, TextInput} from "react-native-paper";
import React, {useState} from "react";
import {StyleSheet} from "react-native";

 const EnterPIN = () => {

    const [pin, setPIN]= useState('')

    return(
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={()=>{}}/>
                <Appbar.Content title={"Enter PIN"}/>
            </Appbar.Header>
            <SafeScreen>
                {/*<Text variant={"headlineMedium"}>Enter PIN</Text>*/}
                <View style={{
                    marginTop:80,
                    width:"80%",
                    alignSelf:"center",
                }}>
                    <TextInput inputMode={"numeric"} secureTextEntry
                               mode={"outlined"}
                               onChangeText={(text)=>setPIN(text)} placeholder={"Enter PIN"} autoCapitalize={"none"}/>
                    <Text style={{color:"white", margin:10}} variant={"bodyMedium"} > Forgot PIN?</Text>
                </View>


            </SafeScreen>
        </>
    )

}

const style =  StyleSheet.create({
    pin_button:{
        borderRadius: 50,
    }

})


export default EnterPIN