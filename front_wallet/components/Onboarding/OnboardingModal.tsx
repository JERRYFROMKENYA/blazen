import React, { useState } from 'react';
import { StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Portal, Text, Button, ProgressBar, TextInput, Icon } from 'react-native-paper';
import { Modal, View } from "@/components/Themed";
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { useRouter } from "expo-router";
import {storeUserDID, useDidOperations} from "@/components/utils/did_operations";
import { useLoading } from "@/components/utils/LoadingContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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

const idTypes = ["Passport", "National ID", "Driver's License", "Other"];

interface OnboardingModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ visible, onDismiss }) => {
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
    settings: { pin: '' },
    delete_request: '',
    delete_reason: '',
    is_banned: false,
    pin:''
  });
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [idTypeModalVisible, setIdTypeModalVisible] = useState(false);
  const [passportPhoto, setPassportPhoto] = useState<any>(null);
  const [idPhoto, setIdPhoto] = useState<any>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [personalDid, setPersonalDid] = useState('');
  const [usePersonalDid, setUsePersonalDid] = useState(false);
  const { user, signOut } = useAuth();
  const { pb } = usePocketBase();
  const router = useRouter();
  const { setDHTDid } = useDidOperations();
  const { setLoading } = useLoading();

  const steps = [
    "Welcome to the app! Let's get started.",
    "Step 1: How I'd like to be called",
    "Step 2: Where I live",
    "Step 3: My Identification",
    "All done! Please verify your email to continue."
  ];

  const createWallet = async (userId: string, country: string) => {
    const countryToCurrency = {
      "US": "USD",
      "AU": "AUD",
      "UK": "GBP",
      "KE": "KES",
      "MX": "MXN",
      "EU": "EUR",
      "GH": "GHS",
      "NG": "NGN"
    };

    const currency = countryToCurrency[country];

    try {
      const response = await pb.collection('wallet').create({
        user: userId,
        currency: currency,
        balance: 0, // Initial balance
        provider: "NexX Testing Wallet",
        address: userId
      });
      return response;
    } catch (error) {
      console.error('Error creating wallet:', error);
      return null;
    }
  };

  const handleNext = async () => {
    if (step === 1 && !usernameAvailable) {
      setErrorMessage('Username is taken. Please choose another one.');
      return;
    }
    setErrorMessage('');
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key as keyof typeof formData]);
      });
      handleChange('name', formData.username);
      formDataToSend.append('settings', JSON.stringify(formData.settings));

      if (passportPhoto) {
        // formDataToSend.append('avatar',new File(
        //     [passportPhoto],
        //     passportPhoto.name,
        //     { type: passportPhoto}
        // ));
      }
      if (idPhoto) {
      // formDataToSend.append('avatar',new File(
      //     [idPhoto],
      //     idPhoto.name,
      //     { type: idPhoto}
      // ));
      }
      const createdRecord = await pb.collection('users').update(user.id, formDataToSend);
      if (createdRecord) {
        await pb.collection('users').requestVerification(user.email);
        Alert.alert("Complete", "Please verify your email to continue. Then Login");
      }
      await createWallet(user.id, formData.country);
      if (usePersonalDid && personalDid) {
        await storeUserDID(user, pb, JSON.parse(personalDid),"dht" ,'user_import');
      } else {
        await setDHTDid();
      }
      setLoading(false);
      signOut();
      router.replace('/(auth)/login');
    }
    setLoading(false);
  };

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const openCountryModal = () => setCountryModalVisible(true);
  const closeCountryModal = () => setCountryModalVisible(false);

  const openIdTypeModal = () => setIdTypeModalVisible(true);
  const closeIdTypeModal = () => setIdTypeModalVisible(false);

  const handleCountrySelect = (code: string) => {
    handleChange('country', code);
    closeCountryModal();
  };

  const handleIdTypeSelect = (type: string) => {
    handleChange('id_type', type);
    closeIdTypeModal();
  };

  const pickDocument = async (setFile: React.Dispatch<any>) => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type === 'success') {
      setFile(result);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setDatePickerVisible(false);
    if (selectedDate) {
      handleChange('date_of_birth', selectedDate.toISOString().split('T')[0]);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    // setErrorMessage('')
    const result = await pb.collection('users').getList(1, 1, {
      filter: `username="${username}"`,
    });
    setUsernameAvailable(result.items.length === 0);
  };
  const handleUsername =(value:string)=>{

    handleChange('username', value);
    checkUsernameAvailability(value);
  }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <KeyboardAwareScrollView contentContainerStyle={styles.scrollView}>
          <Button style={{ alignSelf: "flex-start" }} onPress={() => {
            if (step <= 0) {
              router.back();
              return;
            }
            setStep(step - 1);
          }} icon={() => (<Icon size={20} source={"arrow-left"} />)}>Back</Button>
          <Text style={styles.content}>{steps[step]}</Text>
          <ProgressBar progress={(step + 1) / steps.length} style={styles.progressBar} />
          {step === 1 && (
            <>
              <Text variant={"bodySmall"}>Use Your Government Name</Text>
              <TextInput label="First Name" value={formData.first_name} onChangeText={(value) => handleChange('first_name', value)} style={styles.input} />
              <TextInput label="Middle Name" value={formData.middle_name} onChangeText={(value) => handleChange('middle_name', value)} style={styles.input} />
              <TextInput label="Last Name" value={formData.last_name} onChangeText={(value) => handleChange('last_name', value)} style={styles.input} />
              <Text variant={"bodySmall"}>Use a unique username</Text>
              <TextInput
                label="Username"
                value={formData.username}
                onChangeText={(value) => {
                  handleUsername(value);

                  checkUsernameAvailability(value).then(()=>{
                  })
                }}
                style={styles.input}
              />
              {usernameAvailable === false && <Text style={styles.unavailable}>Username is taken</Text>}
              {usernameAvailable === true && <Text style={styles.available}>Username is available</Text>}
              {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            </>
          )}
          {step === 2 && (
            <>
              <TextInput label="Street Address" value={formData.street_address} onChangeText={(value) => handleChange('street_address', value)} style={styles.input} />
              <TextInput label="State/County" value={formData.state_county} onChangeText={(value) => handleChange('state_county', value)} style={styles.input} />
              <TextInput label="Country" value={formData.country} onFocus={openCountryModal} style={styles.input} />
            </>
          )}
          {step === 3 && (
            <>
              <TextInput label="ID Number" value={formData.id_number} onChangeText={(value) => handleChange('id_number', value)} style={styles.input} />
              <TextInput label="ID Type" value={formData.id_type} onFocus={openIdTypeModal} style={styles.input} />
              <Button onPress={() => pickDocument(setPassportPhoto)}>Upload Passport Photo</Button>
              {passportPhoto && <Image source={{ uri: passportPhoto.uri }} style={styles.imagePreview} />}
              <Button onPress={() => pickDocument(setIdPhoto)}>Upload ID Photo</Button>
              {idPhoto && <Image source={{ uri: idPhoto.uri }} style={styles.imagePreview} />}
              <Button onPress={showDatePicker}>{formData.date_of_birth ?formData.date_of_birth :"Select Date of Birth"}</Button>
              {datePickerVisible && (
                <DateTimePicker
                  value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </>
          )}
          {step === 4 && (
            <>
              <TextInput
                label="6-Digit PIN"
                value={formData.pin}
                onChangeText={(value) => handleChange('pin', value)}
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry
                style={styles.input}
              />
              <Text>Do you want to add your own DID?</Text>
              <Button onPress={() => setUsePersonalDid(!usePersonalDid)}>
                {usePersonalDid ? "No, generate for me" : "Yes, I'll add my own"}
              </Button>
              {usePersonalDid && (
                <TextInput
                  label="Personal DID"
                  value={personalDid}
                  onChangeText={setPersonalDid}
                  style={styles.input}
                />
              )}
            </>
          )}
          <Button mode="contained" onPress={handleNext} style={styles.button} disabled={step === 4 && formData.pin.length !== 6}>
            {step < steps.length - 1 ? "Next" : "Finish"}
          </Button>
        </KeyboardAwareScrollView>
        <Modal visible={countryModalVisible} onRequestClose={closeCountryModal} style={styles.modal}>
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
        <Modal visible={idTypeModalVisible} onRequestClose={closeIdTypeModal} style={styles.modal}>
          <FlatList
            data={idTypes}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleIdTypeSelect(item)}>
                <Text style={styles.modalItem}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
          <Button onPress={closeIdTypeModal}>Close</Button>
        </Modal>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  scrollView: {
    paddingBottom: 20,
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
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
  modal: {
    zIndex: 99,
  },
  available: {
    color: 'green',
  },
  unavailable: {
    color: 'red',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default OnboardingModal;