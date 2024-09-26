import React, { useState } from 'react';
import { StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import {
    Portal,
    Text,
    Button,
    ProgressBar,
    TextInput,
    Icon,
    Appbar,
    Surface,
    Divider,
    PaperProvider, Menu
} from 'react-native-paper';
import { Modal, View } from "@/components/Themed";
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { useRouter } from "expo-router";
import {storeUserDID, useDidOperations} from "@/components/utils/did_operations";
import { useLoading } from "@/components/utils/LoadingContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SafeScreen from "@/components/SafeScreen/SafeScreen";

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
        delete_request: '',
        delete_reason: '',
        is_banned: false,
        pin:'',
        username: '',
        settings:{onboarding:true}
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
        "Welcome to the NexX! Let's get started.\n" +
        "We are going to ask you a few questions to get to know you",
        "Step 1: How you'd like to be called..",
        "Step 2: Where you live...",
        "Step 3: Your identification...",
        "Step 4: Almost done!"
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


        if (step===1 &&  formData.username.length < 3) {
                setErrorMessage('Username should be at least 3 characters long.');
                return;
            }
        if (step===1 &&  formData.username.length > 16) {
                setErrorMessage('Username should be at most 16 characters long.');
                return;
            }
        if(step===1 &&  (formData.first_name.length === 0||formData.last_name.length === 0||formData.username.length === 0)){
                setErrorMessage('Enter valid names or username');
                return;
            }
        if (step === 1 && !usernameAvailable) {
            return;
        }

        if (step === 4 && formData.pin.length !== 6) {
            setErrorMessage('PIN should be 6 digits long.');
            return
        }

        if(step===4 &&  errorMessage=="PINs do not match"){
            return
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
            try{
                const createdRecord = await pb.collection('users').update(user.id, formDataToSend);
                if (createdRecord) {
                    await pb.collection('users').requestVerification(user.email);
                    Alert.alert("Complete", "Please verify your email to continue, then Login");
                }

            }
            catch(e){
                console.log(e)
            }
            try {
                await createWallet(user.id, formData.country);
                if (usePersonalDid && personalDid) {
                    await storeUserDID(user, pb, JSON.parse(personalDid),"dht" ,'user_import');
                } else {
                    await setDHTDid();
                }
            }catch (e){

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
        setErrorMessage('')
        const result = await pb.collection('users').getList(1, 1, {
            filter: `username="${username}"`,
        });
        setUsernameAvailable(result.items.length === 0);

        if(username.toLowerCase().includes("nexx")){
            setErrorMessage("Username cannot contain 'nexx'");
            setUsernameAvailable(false);
        }
    };
    const handleUsername =(value:string)=>{

        handleChange('username', value);
        checkUsernameAvailability(value);
    }
    const handlePIN=(value:string)=>{
        setErrorMessage('')
        if(value.length<6){
            setErrorMessage("PIN should be 6 digits long")
            return
        }
        if(value!==formData.pin){
            setErrorMessage("PINs do not match")
            return
        }

    }


    const IDPicker = () => {
        const [visible, setVisible] = React.useState(false);

        const openMenu = () => setVisible(true);

        const closeMenu = () => setVisible(false);

        return (


                    <Menu
                        visible={visible}
                        onDismiss={closeMenu}
                        anchor={<Button onPress={openMenu}>{formData.id_type==''? "Identification Type":formData.id_type}</Button>}>

                        {idTypes.map((item) => {return(<>
                            <Menu.Item onPress={() => {
                          handleIdTypeSelect(item)
                        }} title={item} />
                            <Divider />
                        </>)})}

                    </Menu>


        );
    };
    const CountryPicker = () => {
        const [visible, setVisible] = React.useState(false);

        const openMenu = () => setVisible(true);

        const closeMenu = () => setVisible(false);

        return (


            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={(formData.country=='')? <Button  style={{alignSelf:"center"}}  onPress={openMenu}> Tap to select a country</Button>:
                        (<Text variant={"bodyLarge"} style={{alignSelf:"center"}}  onPress={openMenu}>{countryMapping[formData.country]}</Text>)
                    }>

                {Object.entries(countryMapping).map((item) => {return(<>
                    <Menu.Item onPress={() => {
                        handleCountrySelect(item[0])
                    }} title={item[1]} />
                    <Divider />
                </>)})}

            </Menu>


        );
    };

    return (
        <SafeScreen>
            <Appbar.Header>
                <Appbar.Action icon="arrow-left" onPress={() => {
                    if (step <= 0) {
                        router.back();
                        return;
                    }
                    setStep(step - 1);
                }} />
                <Appbar.Content title="Welcome to NexX" />
            </Appbar.Header>
            <Surface elevation={0} style={{width:"100%",
                padding:5,
                flexDirection:"column",borderRadius:20,
                justifyContent:"space-between",alignItems:"center"}}>
                <Image
                    source={require('@/assets/images/adaptive-icon.png')}
                    style={{ width: 200, height: 50, marginBottom: 15,marginTop:20 }}
                />
            </Surface>
            <View >
                <KeyboardAwareScrollView contentContainerStyle={styles.scrollView}>
                    <Text style={styles.content}>{steps[step]}</Text>

                    {step === 1 && (
                        <Surface style={styles.modalContainer}>
                            {usernameAvailable === false && <Text style={styles.unavailable}>Username is taken</Text>}
                            {usernameAvailable === true && <Text style={styles.available}>Username is available</Text>}
                            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                            <Text variant={"bodySmall"}>Use Your Government Name</Text>
                            <TextInput  mode={"outlined"} label="First Name" value={formData.first_name} onChangeText={(value) => handleChange('first_name', value)} style={styles.input} />
                            <TextInput mode={"outlined"} label="Middle Name" value={formData.middle_name} onChangeText={(value) => handleChange('middle_name', value)} style={styles.input} />
                            <TextInput mode={"outlined"} label="Last Name" value={formData.last_name} onChangeText={(value) => handleChange('last_name', value)} style={styles.input} />
                            <Text variant={"bodySmall"}>Use a unique username</Text>
                            <TextInput
                                mode={"outlined"}
                                label="Username"
                                value={formData.username}
                                onChangeText={(value) => {
                                    handleUsername(value);

                                    checkUsernameAvailability(value).then(()=>{
                                    })
                                }}
                                style={styles.input}
                            />

                        </Surface>
                    )}
                    {step === 2 && (
                        <Surface style={styles.modalContainer}>
                            <TextInput mode={"outlined"} multiline placeholder={"123 Dagoretti,\n Naivasha Road"} placeholderTextColor={"gray"} label="Street Address" value={formData.street_address} onChangeText={(value) => handleChange('street_address', value)} style={styles.input} />
                            <TextInput mode={"outlined"} label="State/County" value={formData.state_county} onChangeText={(value) => handleChange('state_county', value)} style={styles.input} />
                            {/*<TextInput mode={"outlined"} label="Country" value={formData.country} onFocus={openCountryModal} style={styles.input} />*/}
                            <CountryPicker/>
                        </Surface>
                    )}
                    {step === 3 && (
                        <Surface style={styles.modalContainer}>
                            <IDPicker/>
                            <TextInput mode={"outlined"} label="Identification Number"
                                       value={formData.id_number}
                                       onChangeText={(value) => handleChange('id_number', value)}
                                       style={styles.input} />


                            <Button onPress={() => pickDocument(setPassportPhoto)}>Upload Passport Photo</Button>
                            {passportPhoto && <Image source={{ uri: passportPhoto.uri }} style={styles.imagePreview} />}
                            <Button onPress={() => pickDocument(setIdPhoto)}>Upload ID Photo</Button>
                            {idPhoto && <Image source={{ uri: idPhoto.uri }} style={styles.imagePreview} />}
                            <Text onPress={showDatePicker}>{formData.date_of_birth ?new Date(formData.date_of_birth).toLocaleDateString() :"Select Date of Birth"}</Text>
                            {datePickerVisible && (
                                <DateTimePicker
                                    value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}
                        </Surface>
                    )}
                    {step === 4 && (
                        <Surface style={styles.modalContainer}>
                            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                            <TextInput
                                mode={"outlined"}
                                label="6-Digit PIN"
                                value={formData.pin}
                                onChangeText={(value) => handleChange('pin', value)}
                                keyboardType="numeric"
                                maxLength={6}
                                secureTextEntry
                                style={styles.input}
                            />
                            <TextInput
                                mode={"outlined"}
                                label="Confirm 6-Digit PIN"
                                onChangeText={(value) => handlePIN(value)}
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
                                    multiline
                                    placeholder={`{
  "did": "did:dht:cm1yqfjzfdtauh33nauwf3sqsijqziwrydicr8dbtho3cucb9nno",
                                "document": {
                                "id": "did:dht:cm1yqfjzfdtauh33nauwf3sqsijqziwrydicr8dbtho3cucb9nno",
                                "verificationMethod": [
                            {
                                "id": "did:dht:cm1yqfjzfdtauh33nauwf3sqsijqziwrydicr8dbtho3cucb9nno#0",
                                "type": "JsonWebKey2020",
                                "controller": "did:dht:cm1yqfjzfdtauh33nauwf3sqsijqziwrydicr8dbtho3cucb9nno",
                                "publicKeyJwk": {
                                "alg": "EdDSA",
                                "crv": "Ed25519",
                                "kty": "OKP",
                                "ext": "true",
                                "key_ops": ["verify"],
                                "x": "YuQHFTco44nzORYnQubOtVLr1oQA6sIcYY8hlk2B-IU",
                                "kid": "0"
                            }
                            }
                                ],
                                "authentication": ["#0"],
                                "assertionMethod": ["#0"],
                                "capabilityInvocation": ["#0"],
                                "capabilityDelegation": ["#0"]
                            },
                                "keySet": {
                                "verificationMethodKeys": [
                            {
                                "privateKeyJwk": {
                                "d": "*************",
                                "alg": "EdDSA",
                                "crv": "Ed25519",
                                "kty": "OKP",
                                "ext": "true",
                                "key_ops": ["sign"],
                                "x": "YuQHFTco44nzORYnQubOtVLr1oQA6sIcYY8hlk2B-IU",
                                "kid": "0"
                            },
                                "publicKeyJwk": {
                                "alg": "EdDSA",
                                "crv": "Ed25519",
                                "kty": "OKP",
                                "ext": "true",
                                "key_ops": ["verify"],
                                "x": "YuQHFTco44nzORYnQubOtVLr1oQA6sIcYY8hlk2B-IU",
                                "kid": "0"
                            },
                                "relationships": [
                                "authentication",
                                "assertionMethod",
                                "capabilityInvocation",
                                "capabilityDelegation"
                                ]
                            }
                                ]
                            }
                            }`}
                                    placeholderTextColor={"gray"}
                                />
                            )}
                        </Surface>
                    )}
                    <ProgressBar progress={(step + 1) / steps.length} style={styles.progressBar} />
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
            </View>
        </SafeScreen>
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
      padding: 20,
  },
  progressBar: {
    marginBottom: 10,

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