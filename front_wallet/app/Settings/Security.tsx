import React, { useState, useEffect } from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import { Text, Appbar, Button, TextInput } from 'react-native-paper';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { useAuth } from '@/app/(auth)/auth';
import { usePocketBase } from '@/components/Services/Pocketbase';
import {useRouter} from "expo-router";

const SecurityScreen = () => {
  const { user } = useAuth();
  const { pb } = usePocketBase();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
const [confirmPIN, setConfirmPIN] = useState('');
const router =useRouter()
  useEffect(() => {
    // Check if the user already has a PIN set
    const checkPin = async () => {
      const userData = await pb.collection('users').getOne(user.id);
      setIsPinSet(!!userData.pin);
    };

    checkPin();
  }, [pb, user.id]);

  const handleSetPin = async () => {
      if(pin!==confirmPIN) {
          Alert.alert("Error", "PINs do not match");
          return;
      }
    setLoading(true);
    await pb.collection('users').update(user.id, { pin });
    setLoading(false);
    Alert.alert('Success', 'PIN has been set successfully');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Security Settings" />
      </Appbar.Header>
      <SafeScreen>
        <Text style={styles.infoText}>
          {isPinSet ? 'Change your 6-digit PIN for Multi-Factor Authentication:' : 'Set up your 6-digit PIN for Multi-Factor Authentication:'}
        </Text>
        <TextInput
          label="6-digit PIN"
          value={pin}
          secureTextEntry={true}
          onChangeText={text => setPin(text)}
          keyboardType="numeric"
          maxLength={6}
          style={styles.input}
        />
          <TextInput
              label="Confirm 6-digit PIN"
              value={confirmPIN}
              secureTextEntry={true}
              onChangeText={text => setConfirmPIN(text)}
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
          />
        <Button mode="contained" onPress={handleSetPin} loading={loading} style={styles.button}>
          {isPinSet ? 'Change PIN' : 'Set PIN'}
        </Button>
      </SafeScreen>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default SecurityScreen;