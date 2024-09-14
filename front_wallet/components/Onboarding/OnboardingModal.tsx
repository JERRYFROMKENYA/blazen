import React, { useState } from 'react';
import { StyleSheet, ScrollView, useColorScheme, FlatList, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Portal, Text, Button, ProgressBar, TextInput } from 'react-native-paper';
import { Modal, View } from "@/components/Themed";
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";

const countryMapping = {
  "US": "United States",
  "AU": "Australia",
  "UK": "United Kingdom",
  "KE": "Kenya",
  "MX": "Mexico",
  "EU": "Eurozone",
  "GH": "Ghana",
  "NG": "Nigeria"
};

const OnboardingModal = ({ visible, onDismiss }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    emailVisibility: false,
    password: '',
    passwordConfirm: '',
    oldPassword: '',
    name: '',
    street_address: '',
    state_county: '',
    country: '',
    date_of_birth: '',
    done_with_kyc: false,
    id_type: '',
    id_number: '',
    is_pep: false,
    first_name: '',
    middle_name: '',
    last_name: '',
    settings: '',
    delete_request: '',
    delete_reason: '',
    is_banned: false,
  });
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [idPhoto, setIdPhoto] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const { user } = useAuth();
  const { pb } = usePocketBase();

  const steps = [
    "Welcome to the app! Let's get started.",
    "Step 1: How I'd like to be called",
    "Step 2: Where I live",
    "Step 3: My Identification",
    "All done! Please verify your email to continue."
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (passportPhoto) {
        formDataToSend.append('avatar', {
          uri: passportPhoto.uri,
          name: passportPhoto.name,
          type: passportPhoto.type,
        });
      }
      if (idPhoto) {
        formDataToSend.append('id_document', {
          uri: idPhoto.uri,
          name: idPhoto.name,
          type: idPhoto.type,
        });
      }
      // Send formDataToSend to PocketBase

      const createdRecord = await pb.collection('users').update(user.id, formData);
      if (createdRecord) {
        await pb.collection('users').requestVerification(user.email);
        Alert.alert("Complete", "Please verify your email to continue.");
      }
      onDismiss();
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const openCountryModal = () => setCountryModalVisible(true);
  const closeCountryModal = () => setCountryModalVisible(false);

  const handleCountrySelect = (code) => {
    handleChange('country', code);
    closeCountryModal();
  };

  const pickDocument = async (setFile) => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      setFile(result);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date_of_birth;
    setDatePickerVisible(Platform.OS === 'ios');
    handleChange('date_of_birth', currentDate.toISOString().split('T')[0]);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={[styles.title, isDarkMode && styles.titleDark]} onPress={() => { setStep(step - 1) }}> {"< Back"} </Text>
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>Onboarding</Text>
          <Text style={[styles.content, isDarkMode && styles.contentDark]}>{steps[step]}</Text>
          <ProgressBar progress={(step + 1) / steps.length} style={styles.progressBar} />
          {step === 1 && (
            <>
              <Text variant={"bodySmall"} children={"Use Your Government Name"} />
              <TextInput label="First Name" value={formData.first_name} onChangeText={(value) => handleChange('first_name', value)} style={styles.input} />
              <TextInput label="Middle Name" value={formData.middle_name} onChangeText={(value) => handleChange('middle_name', value)} style={styles.input} />
              <TextInput label="Last Name" value={formData.last_name} onChangeText={(value) => handleChange('last_name', value)} style={styles.input} />
              <Text variant={"bodySmall"} children={"Use a unique username"} />
              <TextInput label="Username" value={formData.name} onChangeText={(value) => {
                handleChange('username', value)
                handleChange('name', value)
              }} style={styles.input} />
            </>
          )}
          {step === 2 && (
            <>
              <TextInput label="Street Address" value={formData.street_address} onChangeText={(value) => handleChange('street_address', value)} style={styles.input} />
              <TextInput label="State/County" value={formData.state_county} onChangeText={(value) => handleChange('state_county', value)} style={styles.input} />
              <Button onPress={openCountryModal} style={styles.input}>
                {formData.country ? countryMapping[formData.country] : "Select Country"}
              </Button>
              <Modal visible={countryModalVisible} onRequestClose={closeCountryModal}>
                <FlatList
                  data={Object.entries(countryMapping)}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleCountrySelect(item[0])}>
                      <Text style={styles.modalItem}>{item[1]}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item[0]}
                />
                <Button onPress={closeCountryModal}>Close</Button>
              </Modal>
            </>
          )}
          {step === 3 && (
            <>
              <TextInput label="ID Type" value={formData.id_type} onChangeText={(value) => handleChange('id_type', value)} style={styles.input} />
              <TextInput label="ID Number" value={formData.id_number} onChangeText={(value) => handleChange('id_number', value)} style={styles.input} />
              <Button onPress={showDatePicker} style={styles.input}>
                {formData.date_of_birth ? `DOB: ${formData.date_of_birth}` : "Select Date of Birth"}
              </Button>
              {datePickerVisible && (
                <DateTimePicker
                  value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
              <Button onPress={() => pickDocument(setPassportPhoto)} style={styles.input}>
                {passportPhoto ? "Passport Photo Selected" : "Select Passport Photo"}
              </Button>
              {passportPhoto && (
                <Image source={{ uri: passportPhoto.uri }} style={styles.imagePreview} />
              )}
              <Button onPress={() => pickDocument(setIdPhoto)} style={styles.input}>
                {idPhoto ? "ID Photo Selected" : "Select ID Photo"}
              </Button>
              {idPhoto && (
                <Image source={{ uri: idPhoto.uri }} style={styles.imagePreview} />
              )}
            </>
          )}
          <Button mode="contained" onPress={handleNext} style={styles.button}>
            {step < steps.length - 1 ? "Next" : "Finish"}
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalContainerDark: {
    backgroundColor: '#333',
  },
  scrollView: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  titleDark: {
    color: 'white',
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
  },
  contentDark: {
    color: 'white',
  },
  progressBar: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    alignSelf: 'center',
    marginTop: 20,
  },
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
});

export default OnboardingModal;