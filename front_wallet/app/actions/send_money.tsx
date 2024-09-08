//Action:Send Money
import React, { useEffect, useState } from 'react';
import { StatusBar, Keyboard } from 'expo-status-bar';
import { Platform, StyleSheet, Alert, ScrollView, Animated } from 'react-native';
import { TextInput, Button, Menu, Provider, Card } from 'react-native-paper';
import { Text, View } from '@/components/Themed';
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { getWalletsForLoggedInUser } from "@/components/utils/wallet_ops";
import { formatNumberWithCommas } from "@/components/utils/format";
import SendMoneyAction from "@/components/SendMoney/SendMoneyAction";

export default function SendMoney() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [userWallets, setUserWallets] = useState([]);
  const [walletInUse, setWalletInUse] = useState(null);
  const [visible, setVisible] = useState(false);
  const [offeringsVisible, setOfferingsVisible] = useState(false);
  const [availableOfferings, setAvailableOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [allAvailableOfferings, setAllAvailableOfferings] = useState([]);
  const [pfis, setPfis] = useState([]);
  const [selectedPfi, setSelectedPfi] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const showModal = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);

  const { user } = useAuth();
  const { pb } = usePocketBase();
  const scrollX = new Animated.Value(0);

  useEffect(() => {
    getWalletsForLoggedInUser(user, pb).then(r => {
      setUserWallets(r);
    });

    // Fetch PFIs and offerings
    fetchPFIsAndOfferings();
  }, [user, pb]);

  const fetchPFIsAndOfferings = async () => {
    try {
      const pfiCollection = await pb.collection('pfi').getFullList();
      setPfis(pfiCollection);
      filterOfferings();
      extractAllOfferings(pfiCollection);
    } catch (error) {
      console.error('Error fetching PFIs and offerings:', error);
    }
  };

  const filterOfferings = (currency = '') => {
    const uniqueOfferings = new Set();
    const uniqueCurrencies = new Set();
    pfis.forEach(pfi => {
      Object.values(pfi.offerings).forEach(offering => {
        if (!currency || offering.startsWith(`${currency}:`)) {
          uniqueOfferings.add(offering);
          uniqueCurrencies.add(offering.split(':')[1]);
        }
      });
    });
    setAvailableOfferings(Array.from(uniqueOfferings));
    setAvailableCurrencies(Array.from(uniqueCurrencies));
  };

  const extractAllOfferings = (pfis) => {
    const allOfferings = new Set();
    pfis.forEach(pfi => {
      Object.values(pfi.offerings).forEach(offering => {
        allOfferings.add(offering);
      });
    });
    setAllAvailableOfferings(Array.from(allOfferings));
  };

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const openOfferingsMenu = () => setOfferingsVisible(true);
  const closeOfferingsMenu = () => setOfferingsVisible(false);

  const clearSelectedOffering = () => {
    setSelectedOffering('');
  };

  const handleWalletSelect = (wallet) => {
    setWalletInUse(wallet);
    filterOfferings(wallet.currency);
    clearSelectedOffering();
    closeMenu();
  };

  const handleOfferingSelect = async (offering) => {
    setSelectedOffering(offering);
    closeOfferingsMenu();

    // Fetch PFIs based on the selected offering
    try {
      const response = await fetch('http://138.197.89.72:3000/select-pfi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 'offering':`${offering}` }),
      });
      console.log(offering)
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching PFIs:', error);
    }
  };

  const handlePfiSelect = (pfi) => {
    console.log('Selected PFI:', pfi);
    setSelectedPfi(pfi);
  };

  const handleSendMoney = () => {
    if (recipient && amount && walletInUse && selectedOffering && selectedPfi) {
      if(walletInUse.balance < amount){Alert.alert('Error', 'Insufficient funds'); return;}
      Alert.alert('Success', `Sent ${amount} ${selectedOffering.split(':')[1]} from ${walletInUse.address} to ${recipient}`);
      showModal();
      Keyboard.dismiss();
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.title}>Send Money</Text>

        {/*Select Wallet To Use*/}
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button onPress={openMenu}>{walletInUse ? `${walletInUse.currency}  ${formatNumberWithCommas(walletInUse.balance)} • ${walletInUse.provider}` : 'Select Wallet To Use'}</Button>}>
          {userWallets.map(wallet => (
            <Menu.Item
              key={wallet.id}
              onPress={() => handleWalletSelect(wallet)}
              title={`${wallet.currency}  ${formatNumberWithCommas(wallet.balance)} • ${wallet.provider}`}
            />
          ))}
        </Menu>

        {/*Select Offering PayOut Currency Available*/}
        {walletInUse && <><Menu
            visible={offeringsVisible}
            onDismiss={closeOfferingsMenu}
            anchor={<Button
                onPress={openOfferingsMenu}>{selectedOffering ? `to ${selectedOffering.split(':')[1]}` : 'Select Currency'}</Button>}>
          {availableOfferings.map((offering, index) => (
              <Menu.Item
                  key={index}
                  onPress={() => handleOfferingSelect(offering)}
                  title={offering.replace(':', ' to ')}
              />
          ))}
        </Menu></>}

        {/*Load The PFIs*/}
        {selectedOffering && pfis.length > 0 && (
          <ScrollView>
            {pfis.map(pfi => (
              <Card key={pfi.id} style={styles.card} onPress={() => handlePfiSelect(pfi)}>
                <Card.Content>
                  <Text>{pfi.description}</Text>
                  <Text>1 {walletInUse.currency} = {pfi.payoutUnitsPerPayinUnit}</Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        )}

        {/* Display Selected PFI Details */}
        {selectedPfi && (
          <View style={styles.pfiDetails}>
            <Text>Description: {selectedPfi.description}</Text>
            <Text>Payout Units Per Payin Unit: {selectedPfi.payoutUnitsPerPayinUnit}</Text>
            <Text>Payin Currency: {selectedPfi.payinCurrency}</Text>
            <Text>Payout Currency: {selectedPfi.payoutCurrency}</Text>
            <Text>Payin Methods: {selectedPfi.payinMethods.map(method => method.kind).join(', ')}</Text>
            <Text>Payout Methods: {selectedPfi.payoutMethods.map(method => method.kind).join(', ')}</Text>
          </View>
        )}

        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        {(walletInUse != undefined && selectedOffering && selectedPfi && walletInUse.balance > 0) && <>
          <TextInput
            style={styles.input}
            placeholder="Recipient"
            value={recipient}
            onChangeText={setRecipient}
          />
          <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
            <Text style={{fontWeight:"bold", padding:1}}>{walletInUse.currency ||""} </Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <Button mode={"outlined"} children="Send" onPress={handleSendMoney} />
        </>}
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.title}>All Available Offerings:</Text>
        <View style={{flexWrap:"wrap" ,flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
          {allAvailableOfferings.map((offering, index) => (
            <Text key={index}> • {offering.replace(':', ' to ')} </Text>
          ))}
        </View>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
      <SendMoneyAction details={{
        recipient: recipient,
        amount: amount,
        walletInUse: walletInUse,
        selectedOffering: selectedOffering
      }} visible={modalVisible} hide={hideModal} />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop:60,
    padding: 20,
  },
  banner: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  bannerText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 15,
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
  pfiDetails: {
    marginVertical: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    width: '100%',
  },
  card: {
    marginVertical: 10,
    width: '100%',
  },
});