import React, { useState } from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import { Text, Appbar, Button, TextInput, Avatar } from 'react-native-paper';
import { useAuth } from '@/app/(auth)/auth';
import { usePocketBase } from '@/components/Services/Pocketbase';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import * as ImagePicker from 'expo-image-picker';
import {useRouter} from "expo-router";

const ProfileScreen = () => {
  const { user } = useAuth();
  const { pb } = usePocketBase();
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [loading, setLoading] = useState(false);
  const router=useRouter()

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.uri);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('username', username);
    if (avatar !== user.avatar) {
      const response = await fetch(avatar);
      const blob = await response.blob();
      formData.append('avatar', blob);
    }

    await pb.collection('users').update(user.id, formData);
    // setUser({ ...user, username, avatar });
    setLoading(false);
    Alert.alert('Profile updated successfully', 'Your profile has been updated successfully. You need to log out for some changes to be visible');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Edit Profile" />
      </Appbar.Header>
      <SafeScreen>
        <View style={styles.profileContainer}>
          <Avatar.Image size={100} source={{ uri: avatar }} style={styles.avatar} />
          <Button mode="contained" onPress={handlePickImage} style={styles.button}>
            Change Profile Picture
          </Button>
          <TextInput
            label="Username"
            value={username}
            onChangeText={text => setUsername(text)}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleUpdateProfile} loading={loading} style={styles.button}>
            Update Profile
          </Button>
          <Button mode={"elevated"} style={{margin:5,backgroundColor:"maroon"}} textColor={"white"}> Delete NexX Account</Button>
        </View>
      </SafeScreen>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default ProfileScreen;