import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';

const PayBillModal = ({ visible, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');

  const handlePay = () => {
    onSubmit(amount);
    onClose();
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>Pay Bill</Text>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={handlePay} style={styles.button}>
            Pay
          </Button>
          <Button mode="text" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modal: {
    width: 300,
    padding: 20,
    backgroundColor: 'gray',
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
});

export default PayBillModal;