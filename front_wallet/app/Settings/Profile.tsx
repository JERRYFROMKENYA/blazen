import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Appbar, Button, TextInput, Avatar } from 'react-native-paper';
import { useAuth } from '@/app/(auth)/auth';
import { usePocketBase } from '@/components/Services/Pocketbase';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const { user, setUser } = useAuth();
  const { pb } = usePocketBase();
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [loading, setLoading] = useState(false);

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
    setUser({ ...user, username, avatar });
    setLoading(false);
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