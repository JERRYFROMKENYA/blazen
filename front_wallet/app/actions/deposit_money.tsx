import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Alert } from 'react-native';
import { View } from '@/components/Themed';
import {TextInput, Button, Text, Menu, Divider, Provider, Icon} from 'react-native-paper';

export default function DepositMoney() {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState({ cardNumber: '', expiryDate: '', cvv: '', phoneNumber: '' });

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleDeposit = () => {
    if (paymentMethod && (details.cardNumber || details.phoneNumber)) {
      Alert.alert('Success', `Deposited using ${paymentMethod}`);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.title}>Deposit Money</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button icon={()=>{return <Icon source={"chevron-down"} size={20}/>;}} onPress={openMenu}>{paymentMethod || 'Select Payment Method '}</Button>}>
          <Menu.Item onPress={() => { setPaymentMethod('Credit Card'); closeMenu(); }} title="Credit Card" />
          <Menu.Item onPress={() => { setPaymentMethod('Mpesa'); closeMenu(); }} title="Mpesa" />
        </Menu>

        {paymentMethod === 'Credit Card' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              value={details.cardNumber}
              onChangeText={(text) => setDetails({ ...details, cardNumber: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Expiry Date"
              value={details.expiryDate}
              onChangeText={(text) => setDetails({ ...details, expiryDate: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="CVV"
              value={details.cvv}
              onChangeText={(text) => setDetails({ ...details, cvv: text })}
              keyboardType="numeric"
            />
          </>
        )}

        {paymentMethod === 'Mpesa' && (
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={details.phoneNumber}
            onChangeText={(text) => setDetails({ ...details, phoneNumber: text })}
            keyboardType="phone-pad"
          />
        )}

        <Button mode="outlined" onPress={handleDeposit}>Deposit</Button>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
});
