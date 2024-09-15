import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Button, Portal, Text, TextInput } from 'react-native-paper';
import { Modal, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { useAuth } from "@/app/(auth)/auth";

const BillCreationScreen = ({ navigation }) => {
  const { pb } = usePocketBase();
  const { user } = useAuth();
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Alice', selected: false, amount: '' },
    { id: 2, name: 'Bob', selected: false, amount: '' },
    // Add more participants as needed
  ]);
  const [splitEqually, setSplitEqually] = useState(true);
  const [description, setDescription] = useState('');
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [merchantCode, setMerchantCode] = useState('');
  const [errors, setErrors] = useState({ totalAmount: '', description: '', merchantCode: '' });

  const toggleParticipant = (id) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const handleSplitChange = () => {
    setSplitEqually(!splitEqually);
    if (!splitEqually) {
      const equalAmount = (parseFloat(totalAmount) / participants.filter(p => p.selected).length).toFixed(2);
      setParticipants(participants.map(p => p.selected ? { ...p, amount: equalAmount } : p));
    }
  };

  const validateInputs = () => {
    let valid = true;
    let newErrors = { totalAmount: '', description: '', merchantCode: '' };

    if (!totalAmount || isNaN(totalAmount) || parseFloat(totalAmount) <= 0) {
      newErrors.totalAmount = 'Please enter a valid total amount.';
      valid = false;
    }

    if (!description) {
      newErrors.description = 'Description is required.';
      valid = false;
    }

    if (!merchantCode) {
      newErrors.merchantCode = 'Merchant code is required.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const getMerchant = async () => {
    return await pb.collection('merchants').getFirstListItem(`merchant_code="${merchantCode}"`);
  };

  const handleCreateBill = async () => {
    if (!validateInputs()) return;
    const merchant = await getMerchant();

    Alert.alert(
      'Confirm Bill Creation',
      `Are you sure you want to pay a bill in the amount of ${totalAmount} ${selectedCurrency} to merchant ${merchant.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const bill_data = await pb.collection("vows").create({
              total_amount: {
                amount: totalAmount,
                currency: selectedCurrency
              },
              description,
              created_by: user.id,
              beneficiary: merchant.id
            });
            const participant=await pb.collection("vow_participants").create({
                vow:bill_data.id,
                user:user.id,
                amount_due:totalAmount
            })

            // Navigate to Bill Details Screen with the bill data
            router.push(`/split_bill/BillDetails/${bill_data.id}`);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const openCurrencyModal = () => setCurrencyModalVisible(true);
  const closeCurrencyModal = () => setCurrencyModalVisible(false);

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    closeCurrencyModal();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Create Bill" />
      </Appbar.Header>
      <SafeScreen>
        <Text variant={"bodySmall"}>for the demo use (2512,3011,1204)</Text>
        <TextInput
          label="Merchant Code"
          value={merchantCode}
          onChangeText={setMerchantCode}
          style={styles.input}
          keyboardType={"numeric"}
          error={!!errors.merchantCode}
        />
        {errors.merchantCode ? <Text style={styles.errorText}>{errors.merchantCode}</Text> : null}
        <Button mode={"contained-tonal"} onPress={openCurrencyModal} style={styles.input}>
          {selectedCurrency}
        </Button>
        <TextInput
          label={`Total Amount (${selectedCurrency})`}
          value={totalAmount}
          onChangeText={setTotalAmount}
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.totalAmount}
        />
        {errors.totalAmount ? <Text style={styles.errorText}>{errors.totalAmount}</Text> : null}
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          error={!!errors.description}
        />
        {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
        <Button mode="contained" onPress={handleCreateBill}>
          Create Bill
        </Button>
      </SafeScreen>
      <Portal>
        <Modal visible={currencyModalVisible} onDismiss={closeCurrencyModal} contentContainerStyle={styles.modalContainer}>
          <FlatList
            data={['USD', 'EUR', 'GBP', 'KES']}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleCurrencySelect(item)}>
                <Text style={styles.modalItem}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
          />
          <Button onPress={closeCurrencyModal}>Close</Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  input: {
    marginBottom: 10,
    margin: 5,
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  amountInput: {
    marginLeft: 10,
    width: 80,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default BillCreationScreen;