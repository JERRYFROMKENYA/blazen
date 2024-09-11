import React, { useState } from 'react';
import { Surface, TextInput, Text, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import SafeScreen from '@/components/SafeScreen/SafeScreen';

type PayInProperties = {
  [key: string]: { title: string, value: any };
};

type PayInFormProps = {
  handleSendMoney: (data: { [key: string]: any }) => void;
  payInProperties: PayInProperties;
  walletInUse: { currency: string };
  amount: string;
  setAmount: (amount: string) => void;
};

const PayInForm: React.FC<PayInFormProps> = ({ handleSendMoney, payInProperties, walletInUse, setAmount, amount }) => {
  const [state, setState] = useState(payInProperties);


  const handleChange = (key: string, value: any) => {
    setState(prevState => ({
      ...prevState,
      [key]: { ...prevState[key], value },
    }));
  };

  const handleSubmit = () => {
    const formData = Object.keys(state).reduce((acc, key) => {
      acc[key] = state[key].value;
      return acc;
    }, {} as { [key: string]: any });
    handleSendMoney(formData);
  };

  return (
    <View style={styles.container}>
      {Object.keys(state).map(key => (
        <TextInput
          style={styles.input}
          mode="outlined"
          key={key}
          label={state[key].title}
          value={state[key].value}
          onChangeText={(value) => handleChange(key, value)}
        />
      ))}
      <TextInput
        mode="outlined"
        style={styles.input}
        label={`Amount in ${walletInUse.currency}`}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button mode="outlined" onPress={handleSubmit}>
        Get Quote
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '90%',
  },
});

export default PayInForm;