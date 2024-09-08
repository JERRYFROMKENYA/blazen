import React, { useState } from 'react';
import { View } from '@/components/Themed';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { useAuth } from '@/app/(auth)/auth';
import {useRouter} from "expo-router";
// import {transparent} from "react-native-paper/lib/typescript/styles/themes/v2/colors";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
    // @ts-ignore
  const {signIn, signOut, createNewAccount} = useAuth();
  const router =useRouter()



  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async () => {
    // @ts-ignore
    const result = await signIn(email, password);
    if (result.error) {
      console.error(result.error);
    } else {
      console.log("Logged in successfully");
      router.replace("/(tabs)/")
    }
  };

  const handleSignUp = async () => {
    // @ts-ignore
    const result = await createNewAccount({ email, password, passwordConfirm: confirmPassword, name: "" });
    if (result.error) {
      console.error(result.error);
    } else {
      console.log("Account created successfully");
      router.replace("/(tabs)/")

    }
  };

  return (
    <SafeScreen>
      <View style={{
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}>
        <View
          style={{ height: 200, width: "100%",  borderBottomLeftRadius: 50, borderBottomRightRadius: 50, justifyContent: "flex-end", alignItems: "baseline", padding: 20, marginBottom: 20 }}
        >
          <Text variant={"displayLarge"}>{isLogin ? "Login" : "Sign Up"}</Text>
        </View>

        <Surface style={{ height: "auto", width: "95%", padding: 20, borderRadius: 20, justifyContent: "space-between" }}>
          <TextInput label={"Email"} onChangeText={setEmail} />
          <View style={{ height: 10,backgroundColor:"transparent" }}></View>
          <TextInput secureTextEntry label={"Password"} onChangeText={setPassword} />
          {!isLogin && (
            <>
              <View style={{ height: 10,backgroundColor:"transparent" }}></View>
              <TextInput label={"Confirm Password"} secureTextEntry onChangeText={setConfirmPassword} />
            </>
          )}
          <View style={{ height: 10,backgroundColor:"transparent" }}></View>
          <Button mode={"contained-tonal"} onPress={isLogin ? handleLogin : handleSignUp}>{isLogin ? "Login" : "Sign Up"}</Button>
          <View style={{ flexDirection: "row", justifyContent: "space-between", margin: 10, backgroundColor:"transparent" }}>
            <Button style={{ alignSelf: "flex-start" }} onPress={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Login"}
            </Button>
            {isLogin && <Button style={{ alignSelf: "flex-end" }}>Forgot Password?</Button>}
          </View>
        </Surface>
      </View>
    </SafeScreen>
  );
}