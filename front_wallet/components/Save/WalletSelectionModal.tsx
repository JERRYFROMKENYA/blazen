import React, { useState } from 'react';
import { Modal, View, StyleSheet, FlatList, TextInput } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';

interface Wallet {
  id: string;
  currency: string;
  balance: number;
}

interface WalletSelectionModalProps {
  visible: boolean;
  wallets: Wallet[];
  onSelect: (wallet: Wallet, amount: number) => void;
  onClose: () => void;
}

const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({ visible, wallets, onSelect, onClose }) => {
  const [amount, setAmount] = useState('');

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalBackground}>
        <Surface style={styles.modalContent}>
          <Text variant="titleMedium">Select Wallet</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <FlatList
            data={wallets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Surface style={styles.walletItem}>
                <Text>{item.currency}</Text>
                <Text>Balance: {item.balance}</Text>
                <Button mode="contained" onPress={() => onSelect(item, parseFloat(amount))}>Select</Button>
              </Surface>
            )}
          />
          <Button onPress={onClose}>Close</Button>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    // backgroundColor: '#fff',
  },
  walletItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    // backgroundColor: '#f0f0f0',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default WalletSelectionModal;