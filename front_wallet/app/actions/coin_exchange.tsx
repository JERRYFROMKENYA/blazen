import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  Keyboard,
  Alert,
  ScrollView,
  Animated,
  Platform,
  StyleSheet,
  FlatList,
  TouchableOpacity, ImageSourcePropType,
} from 'react-native';
import {Text, TextInput, Button, Menu, Provider, Card, Appbar, Icon} from 'react-native-paper';
import {  View,Modal } from '@/components/Themed';
import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { getWalletsForLoggedInUser } from "@/components/utils/wallet_ops";
import { formatNumberWithCommas } from "@/components/utils/format";
import SendMoneyAction from "@/components/CoinExchange/SendMoneyAction";
import PayInForm from "@/components/CoinExchange/payInForm";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import PayinMethodMenu from "@/components/CoinExchange/payinMethodMenu";
import GetQuote from "@/components/CoinExchange/GetQuote";
import {useRouter} from "expo-router";
import {useLoading} from "@/components/utils/LoadingContext";
import { MaterialIcons } from '@expo/vector-icons';



export default function CoinExchange() {
  const router =useRouter();
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
  const [filteredPfis, setFilteredPfis] = useState([]);
  const[showQuote, setShowQuote]=useState(false);
  const [selectedPfi, setSelectedPfi] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const[selectedPayinMethod, setSelectedPayinMethod]=useState(null);
  const[payInDetails, setPayInDetails]=useState({});
  const [receivedQuote, setReceivedQuote] = useState(false);
  const { setLoading } = useLoading();
  const [averageRatings, setAverageRatings] = useState({});
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const openWalletModal = () => setWalletModalVisible(true);
  const closeWalletModal = () => setWalletModalVisible(false);

  const openCurrencyModal = () => setCurrencyModalVisible(true);
  const closeCurrencyModal = () => setCurrencyModalVisible(false);
  const renderWalletItem = ({ item }) => (
      <TouchableOpacity onPress={() => handleWalletSelect(item)}>
        <Text style={styles.modalItem}>{`${item.currency}  ${formatNumberWithCommas(item.balance)} • ${item.provider}`}</Text>
      </TouchableOpacity>
  );

  const renderCurrencyItem = ({ item }) => (
      <TouchableOpacity onPress={() => handleOfferingSelect(item)}>
        <Text style={styles.modalItem}>{item}</Text>
      </TouchableOpacity>
  );


  const onSelectPayinMethod=(method:any)=>{
    setSelectedPayinMethod(method);
  }

  function codeToCurrency(Code:String){
   return  Code.trim().replace("USDC","USD Coin")
        .replace("GHS","Ghananian Cedis")
        .replace("NGN","Nigerian Naira")
        .replace("KES","Kenyan Shilling")
        .replace("USD","US Dollar")
        .replace("EUR","Euro")
        .replace("GBP","Great Britain Pound")
        .replace("BTC","Bitcoin")
        .replace("GB","Great Britain Pound")
        .replace("MXN","Mexican Peso")
        .replace("AUD","Australian Dollar")

  }



const renderStars = (rating) => {
    // console.warn(averageRatings)

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <MaterialIcons
                key={i}
                name={i <= rating ? 'star' : 'star-border'}
                size={20}
                color="#FFD700"
            />
        );
    }
  return <View style={{flexDirection:"row", backgroundColor:"transparent"}}>{stars}</View>;
};

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
      // console.error('Error fetching PFIs and offerings:', error);
    }
  };

  const filterOfferings = (currency = '') => {
    setLoading(true)
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
    setLoading(false)
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
    closeWalletModal();
  };

  const handleOfferingSelect = async (offering) => {
    setLoading(true);
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
      // console.log(offering)
      const data = await response.json();
      console.log(data);
      setFilteredPfis(data);
      setLoading(false)
      closeCurrencyModal();
      fetchPFIsAndOfferings();// Store the filtered PFIs in the new state
    } catch (error) {
      // console.error('Error fetching PFIs:', error);
      setLoading(false)
      closeCurrencyModal();
      fetchPFIsAndOfferings();
    }
    closeCurrencyModal();
    fetchPFIsAndOfferings();




  };

  const handlePfiSelect = (pfi) => {
    setLoading(true);
    // console.log('Selected PFI:', pfi);
    setSelectedPfi(pfi);
    const result = pb.collection("pfi").getFirstListItem(`did = "${pfi.from}"`);
    // console.log("result ",result);
    setLoading(false)
  };

  const handleSendMoney = (payInDetails:{}) => {
    if(walletInUse?.balance < amount){Alert.alert('Error', 'Insufficient funds'); return;}
      setShowQuote(!showQuote);
      // showModal();
      setPayInDetails(payInDetails);
      Keyboard.dismiss();

  };
  const fetchAverageRatings = async () => {
    try {
        const ratings = await pb.collection('pfi_rating').getFullList({expand:"pfi"});
        const pfiRatings = ratings.reduce((acc, rating) => {

            if (!acc[rating.pfi]) {
                acc[rating.expand.pfi.did] = { total: 0, count: 0 };
            }
            // acc[id]=rating.expand.did
            acc[rating.expand.pfi.did].total += rating.rating;
            acc[rating.expand.pfi.did].count += 1;
            return acc;
        }, {});


        const averageRatings = Object.keys(pfiRatings).reduce((acc, pfi) => {
            acc[pfi] = pfiRatings[pfi].total / pfiRatings[pfi].count;
            return acc;
        }, {});

        setAverageRatings(averageRatings);
    } catch (error) {
        // console.error('Error fetching average ratings:', error);
    }
};
  useEffect(() => {
    fetchAverageRatings();
  }, [filteredPfis, pfis,selectedPfi]);

  return (
      <>
        <Appbar.Header>
          <Appbar.Action icon={"arrow-left"} onPress={()=>{router.back()}}/>
          <Appbar.Content title={"Coin Exchange"}/>
        </Appbar.Header>
        <SafeScreen>
          <ExplanationCard/>
          <View style={styles.container}>


            {/*Select Wallet To Use*/}
            {!showQuote && (
                walletInUse ? (
                    <Text onPress={openWalletModal}>{`${walletInUse.currency}  ${formatNumberWithCommas(walletInUse.balance)} • ${walletInUse.provider}`}</Text>
                ) : (
                    <Button onPress={openWalletModal}>Select Wallet To Use</Button>
                )
            )}

            {/* Select Offering PayOut Currency Available */}
            {(!showQuote && walletInUse) && (
                selectedOffering ? (
                    <Text onPress={openCurrencyModal}>{`to ${selectedOffering.split(':')[1]}`}</Text>
                ) : (
                    <Button onPress={openCurrencyModal}>Select Currency</Button>
                )
            )}

            {/*Load The PFIs*/}
            {(!selectedPfi && selectedOffering && filteredPfis.length > 0 && !showQuote)&& (
                <ScrollView>
                  {filteredPfis.map(pfi => (
                      <Card key={pfi.id} style={styles.card} onPress={() => handlePfiSelect(pfi)}>
                        <Card.Content>
                          <Text>{pfi.name}</Text>
                          <Text>{pfi.description}</Text>
                          <Text>1 {walletInUse.currency} = {pfi.payoutUnitsPerPayinUnit} {selectedOffering.split(":")[1]}</Text>
                          <Text variant={"bodySmall"}>{"Kindly note these ratings are based on users who have used this PFI"}</Text>
                          {renderStars(averageRatings[pfi.from] || 0)}
                        </Card.Content>
                      </Card>
                  ))}
                </ScrollView>
            )}

            {/* Display Selected PFI Details */}
            {(selectedPfi && !showQuote)&& (
                <>
                  <View style={styles.pfiDetails}>
                    <Text>{selectedPfi.name}</Text>
                    <Text>{selectedPfi.description}</Text>
                    <Text>1 {selectedPfi.payinCurrency} ={selectedPfi.payoutUnitsPerPayinUnit} {selectedPfi.payoutCurrency}</Text>
                    {/*<Text>{selectedPfi.payinMethods.map(method => method.requiredPaymentDetails.title).join(', ')}</Text>*/}
                    <Text>{selectedPfi.payoutMethods.map(method => method.requiredPaymentDetails.title).join(', ')}</Text>
                    <Text variant={"bodySmall"}>{"Kindly note these ratings are based on users who have used this PFI"}</Text>
                    {renderStars(averageRatings[selectedPfi.from] || 0)}
                  </View>

                  <PayinMethodMenu

                      payinMethods={selectedPfi?.payoutMethods}
                      onSelect={onSelectPayinMethod}
                      selectedPayinMethod={selectedPayinMethod}
                  />
                </>

            )}
            {/* Display A Menu With Each of the selectedPfi 's payinMethods */}
            {(!showQuote && walletInUse != undefined && selectedPayinMethod && selectedOffering && selectedPfi && walletInUse.balance > 0) && <>
              <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
              {/*Render Input depending on the payInMethods*/}
              <PayInForm handleSendMoney={handleSendMoney}
                         amount={amount}
                         setAmount={setAmount}
                         payInProperties={selectedPayinMethod.requiredPaymentDetails.properties}
                         walletInUse={walletInUse}
                         method={selectedPayinMethod}

              />
            </>}
            {/* Render A Quote*/}
            {(showQuote&&!receivedQuote) && <GetQuote
                setQuoteReceived={setReceivedQuote}
                paymentDetails={payInDetails}
                setShowQuote={setShowQuote}
                offering={selectedPfi.offering}
                amount={amount}
                showQuote={showQuote}
                wallet={walletInUse}
            />}


            {/*TODO 4: */}
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <Text style={styles.title} onPress={()=>{setShowQuote(!showQuote)}}>All Available Offerings:</Text>
            <View style={{flexWrap:"wrap" ,flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              {allAvailableOfferings.map((offering, index) => (
                  <Text key={index}> • {codeToCurrency(offering.replace(':', ' to '))} </Text>
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
        </SafeScreen>

        <Modal visible={walletModalVisible} onRequestClose={closeWalletModal}>
        <FlatList
            data={userWallets}
            renderItem={renderWalletItem}
            keyExtractor={(item) => item.id}
        />
        <Button onPress={closeWalletModal}>Close</Button>
      </Modal>

  <Modal visible={currencyModalVisible} onRequestClose={closeCurrencyModal}>
    <FlatList
        data={availableOfferings}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => item}
    />
    <Button onPress={closeCurrencyModal}>Close</Button>
  </Modal>

      </>

  );
}

const privacyShieldImage: ImageSourcePropType = require('@/assets/images/coin_exchange.png');

const ExplanationCard = () => {
  const [hidden, setHidden] = React.useState(false);
  console.log(hidden)
  return (
      !hidden && (
          <Card style={{ marginVertical: 10 }}>
            <Card.Cover style={{ width: "100%" }} source={privacyShieldImage} />
            <Card.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 5, marginTop: 5 }}>
                {"What is a Coin Exchange?"}
              </Text>
              <Text variant="bodySmall">
                {"Our flag ship feature Coin Exchange on the tbdex" +
                    " network allows you to exchange whatever currency you have for another on our next wallet app," +
                    "we are backed by amazing and highly scrutinized Financial Institutions(PFIs)"}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                  style={{ alignSelf: "flex-end" }}
                  icon={() => <Icon size={20} source={"close"} />}
                  onPress={() => setHidden(!hidden)}
              >
                {"Close"}
              </Button>
            </Card.Actions>

          </Card>
      )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'flex-start',
    paddingTop: 60,
    padding: 20,
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
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  }
});