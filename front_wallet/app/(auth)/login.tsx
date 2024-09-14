import React, { useState } from 'react';
import { View, Image, Alert } from 'react-native';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { Button, Surface, Text, TextInput } from "react-native-paper";
import { useAuth } from '@/app/(auth)/auth';
import { useRouter } from "expo-router";
import { usePocketBase } from "@/components/Services/Pocketbase";
import OnboardingModal from '@/components/Onboarding/OnboardingModal';

export default function AuthScreen() {
  const { pb } = usePocketBase();
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, createNewAccount } = useAuth();
  const router = useRouter();
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);

  const handlePasswordReset = async () => {
    await pb.collection('users').requestPasswordReset(resetEmail).then((res) => {
      Alert.alert("Password Reset", "Password reset email sent successfully, check your Inbox");
    });
  };

  const handleLogin = async () => {
    const result = await signIn(email, password);
    if (result && result.error) {
      console.error(result.error);
    } else {
      console.log("Logged in successfully");
      router.replace("/(tabs)/");
    }
  };

  const handleSignUp = async () => {
    const result = await createNewAccount({ email, password, passwordConfirm: confirmPassword, name: "" });
    if (result && result.error) {
      console.error(result.error);
    } else {
      console.log("Account created successfully");
      setIsOnboardingVisible(true);
    }
  };

  return (
    <SafeScreen onRefresh={() => { }}>
      <View style={{ justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
        <Image
          source={require('@/assets/images/adaptive-icon.png')}
          style={{ width: 200, height: 200, marginBottom: 20 }}
        />
        <Surface style={{
          height: "auto",
          marginBottom: 100,
          width: "95%",
          padding: 20,
          paddingTop: 8,
          borderRadius: 20,
          justifyContent: "space-between"
        }}>
          <Text variant={"titleLarge"} style={{ alignSelf: "center", margin: 12, marginTop: 0 }}>{isLogin ? "Login" : "Sign Up"}</Text>
          {isPasswordReset ? (
            <>
              <TextInput label={"Email"} onChangeText={setResetEmail} />
              <View style={{ height: 10, backgroundColor: "transparent" }}></View>
              <Button mode={"contained-tonal"} onPress={handlePasswordReset}>Reset Password</Button>
              <Button onPress={() => setIsPasswordReset(false)}>Back to Login</Button>
            </>
          ) : (
            <>
              <TextInput label={"Email"} onChangeText={setEmail} />
              <View style={{ height: 10, backgroundColor: "transparent" }}></View>
              <TextInput secureTextEntry label={"Password"} onChangeText={setPassword} />
              {!isLogin && (
                <>
                  <View style={{ height: 10, backgroundColor: "transparent" }}></View>
                  <TextInput label={"Confirm Password"} secureTextEntry onChangeText={setConfirmPassword} />
                </>
              )}
              <View style={{ height: 10, backgroundColor: "transparent" }}></View>
              <Button mode={"contained-tonal"}
                onPress={isLogin ? handleLogin : handleSignUp}>{isLogin ? "Login" : "Sign Up"}</Button>
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                margin: 10,
                backgroundColor: "transparent"
              }}>
                <Button style={{ alignSelf: "flex-start" }} onPress={() => setIsLogin(!isLogin)}>
                  {isLogin && !isPasswordReset ? "Sign Up" : "Login"}
                </Button>
                {isLogin && <Button style={{ alignSelf: "flex-end" }} onPress={() => setIsPasswordReset(true)}>Forgot
                  Password?</Button>}
              </View>
            </>
          )}
        </Surface>
      </View>
      <OnboardingModal visible={isOnboardingVisible} onDismiss={() => setIsOnboardingVisible(false)} />
    </SafeScreen>
  );
}