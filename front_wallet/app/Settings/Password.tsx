import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Text, Appbar, Button, TextInput } from 'react-native-paper';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { useAuth } from '@/app/(auth)/auth';
import { usePocketBase } from '@/components/Services/Pocketbase';
import { useRouter } from "expo-router";

const PasswordScreen = () => {
  const { user } = useAuth();
  const { pb } = usePocketBase();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await pb.collection('users').authWithPassword(user.email, currentPassword);
      await pb.collection('users').update(user.id, { password: newPassword });
      Alert.alert("Success", "Password changed successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Change Password" />
      </Appbar.Header>
      <SafeScreen>
        <Text style={styles.infoText}>Change your password:</Text>
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={text => setCurrentPassword(text)}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={text => setNewPassword(text)}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          label="Confirm New Password"
          value={confirmNewPassword}
          onChangeText={text => setConfirmNewPassword(text)}
          secureTextEntry
          style={styles.input}
        />
        <Button mode="contained" onPress={handleChangePassword} loading={loading} style={styles.button}>
          Change Password
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

export default PasswordScreen;