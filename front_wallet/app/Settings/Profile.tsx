import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import { Text, Appbar, Button, TextInput, Avatar } from 'react-native-paper';
import { useAuth } from '@/app/(auth)/auth';
import { usePocketBase } from '@/components/Services/Pocketbase';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import * as ImagePicker from 'expo-image-picker';
import {useRouter} from "expo-router";
import {updateProfilePicture} from "@/components/utils";

const ProfileScreen = () => {
  const { user } = useAuth();
  const { pb } = usePocketBase();
  const [username, setUsername] = useState(user.username);
  const [initialUsername, setInitialUsername]=useState(user.username)
  const [avatar, setAvatar] = useState("https://api.dicebear.com/9.x/pixel-art/jpg?seed="+username);
  const [loading, setLoading] = useState(false);
  const router=useRouter()
  const [newPhoto, setNewPhoto]=useState(null)
  const [usernameError,setUsernameError]=useState(false)
  const [errorMessage, setErrorMessage]=useState<String|null>(null)

  const usernameChange =async (text: String) => {
    setUsernameError(false)
    setErrorMessage(null)
    try {

      const result = await pb.collection('users').getList(1, 1, {
        filter: `username="${text}"`,
      });
      setUsernameError(result.items.length === 0);

      if (text.toLowerCase().includes("nexx")) {
        setErrorMessage("Username cannot contain 'nexx'");
        setUsernameError(true);
      }

    } catch (e) {

    }



  }


  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });


    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      setNewPhoto(result.assets[0])
    }
  };

  const handleUpdateProfile = async () => {
    if(errorMessage||usernameError) return
    if((username.length<3)&&(username!==initialUsername)) return
    setLoading(true);
    const formData = new FormData();
    formData.append('username', username);
    if (newPhoto!==null) {
      await updateProfilePicture(user,newPhoto)
    }

    await pb.collection('users').update(user.id, formData);
    // setUser({ ...user, username, avatar });
    setLoading(false);
    Alert.alert('Profile updated successfully',
        'Your profile has been updated successfully.' +
        ' You need to log out for some changes to be visible',[{text:"OK",onPress:()=>router.back()}]);

  };

  useEffect(() => {
    setAvatar(pb.getFileUrl(user, user?.avatar))
  }, []);

  const handleBack =()=>{
    if(username!==initialUsername) {
      Alert.alert("Are you sure?", "Are you sure you want to discard the changes you made?", [
            {
              text: "Yes",
              onPress: () => {
                router.back()
              }
            },
            {
              text: "No",
              onPress: () => {
              }
            }
          ]
      )
      return
    }
    if(newPhoto){
      Alert.alert("Are you sure?", "Are you sure you want to discard the changes you made?", [
            {
              text: "Yes",
              onPress: () => {
                router.back()
              }
            },
            {
              text: "No",
              onPress: () => {
              }
            }
          ]
      )
      return
    }
    router.back()

  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {
         handleBack()
        }} />
        <Appbar.Content title="Edit Profile" />
      </Appbar.Header>
      <SafeScreen>
        <View style={styles.profileContainer}>
          <Avatar.Image size={100} source={{ uri: newPhoto||avatar }} style={styles.avatar} />
          <Button mode="contained" onPress={handlePickImage} style={styles.button}>
            Change Profile Picture
          </Button>
          {errorMessage&&<Text style={{color:"red"}}>{errorMessage}</Text>}
          <TextInput
              mode={"outlined"}
            label="Username"
            value={username}
            onChangeText={text => {
              setUsername(text)
              usernameChange(text).then(() => {

              })
            }}
            style={styles.input}
              error={usernameError}
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