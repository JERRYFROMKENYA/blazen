import React, { useEffect, useState } from 'react';
import { Surface, TextInput, Text, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import SafeScreen from '@/components/SafeScreen/SafeScreen';
import { usePocketBase } from "@/components/Services/Pocketbase";

type PayInProperties = {
  [key: string]: { title: string, value: any };
};

type PayInFormProps = {
  handleSendMoney: (data: { [key: string]: any }) => void;
  payInProperties: PayInProperties;
  walletInUse: { currency: string };
  amount: string;
  setAmount: (amount: string) => void;
  method: string;
};

const PayInForm: React.FC<PayInFormProps> = ({ handleSendMoney, payInProperties, walletInUse, setAmount, amount, method }) => {
  const [state, setState] = useState(payInProperties);
  const { pb } = usePocketBase();
  const [internalMethod, setInternalMethod] = useState<any>({});

  const handleChange = (key: string, value: any) => {
    setState(prevState => ({
      ...prevState,
      [key]: { ...prevState[key], value },
    }));
  };

  const handleSubmit = () => {
    const formData = method.requiredPaymentDetails.required.reduce((acc, key) => {
      acc[key] = internalMethod.payload[key] || state[key].value;
      return acc;
    }, {} as { [key: string]: any });
    console.log(formData)
    handleSendMoney(formData);
  };

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      console.log(method.requiredPaymentDetails.properties.accountNumber.title)
      const paymentMethods = await pb.collection('internal_payment_methods').getFirstListItem(`name = "${method.kind}"`);
      setInternalMethod(paymentMethods);
    };
    fetchPaymentMethods();
  }, [method, pb]);

  return (
    <View style={styles.container}>
      {/*{Object.keys(state).map(key => (*/}
      {/*  <TextInput*/}
      {/*    style={styles.input}*/}
      {/*    mode="outlined"*/}
      {/*    key={key}*/}
      {/*    label={state[key].title}*/}
      {/*    value={state[key].value}*/}
      {/*    onChangeText={(value) => handleChange(key, value)}*/}
      {/*  />*/}
      {/*))}*/}
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