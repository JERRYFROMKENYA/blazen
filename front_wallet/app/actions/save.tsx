import React, { useEffect, useState } from 'react';
import {StyleSheet, View, Modal, ImageSourcePropType} from 'react-native';
import {Appbar, Button, Card, Icon, Surface, Text} from 'react-native-paper';
import { usePocketBase } from '@/components/Services/Pocketbase';
import { useAuth } from '@/app/(auth)/auth';
import { useLoading } from '@/components/utils/LoadingContext';
import WalletSelectionModal from '@/components/Save/WalletSelectionModal';
import AddPocket from '@/components/Save/AddPocket';
import SafeScreen from "@/components/SafeScreen/SafeScreen";

export default function Savings() {
  const { pb } = usePocketBase();
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const [savingPockets, setSavingPockets] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [selectedPocket, setSelectedPocket] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addPocketVisible, setAddPocketVisible] = useState(false);

  const getSavingPockets = async () => {
    setLoading(true);
    const pockets = await pb.collection('savings_pocket').getFullList({
      filter: `user = "${user.id}"`, expand: 'savings_tier'
    });
    setSavingPockets(pockets);
    setLoading(false);
  };

  const getWallets = async () => {
    const wallets = await pb.collection('wallet').getFullList({
      filter: `user = "${user.id}"`,
    });
    setWallets(wallets);
  };

  useEffect(() => {
    getSavingPockets();
    getWallets();
  }, []);

  const handleTopUp = (pocket) => {
    setSelectedPocket(pocket);
    setModalVisible(true);
  };

  const handleWithdraw = async (pocket) => {
  const currentDate = new Date();
  const lockUntilDate = new Date(pocket.lock_until);

  if (currentDate < lockUntilDate) {
    alert('This pocket is locked until ' + lockUntilDate.toDateString());
    return;
  }

  const userWallet = wallets.find(wallet => wallet.currency === pocket.expand.savings_tier.currency);
  if (!userWallet) {
    alert('You do not have a wallet with the corresponding currency. Please go to your profile and create one.');
    return;
  }

  try {
    setLoading(true);
    await pb.collection('wallet').update(userWallet.id, { balance: userWallet.balance + pocket.amount });
    await pb.collection('savings_pocket').delete(pocket.id);
    getSavingPockets();
    getWallets();
  } catch (error) {
    // console.error('Error updating wallet or pocket:', error);
  } finally {
    setLoading(false);
  }
};

  const handleWalletSelect = async (wallet, amount) => {
    if(!amount) return
    if (amount > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      await pb.collection('wallet').update(wallet.id, { balance: wallet.balance - amount });
      await pb.collection('savings_pocket').update(selectedPocket.id, { amount: selectedPocket.amount + amount });
      getSavingPockets();
      getWallets();
      setModalVisible(false);
    } catch (error) {
      // console.error('Error updating wallet or pocket:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen onRefresh={() => { getSavingPockets(); getWallets(); }}>
      <Appbar.Header>
        <Appbar.Content title="Savings" />
      </Appbar.Header>
      <View>
        <Surface style={styles.surface}>
          <Text variant={"titleSmall"} style={styles.title}>My NexX Pockets</Text>
          <ExplanationCard/>
          {savingPockets.map((pocket: any) => (
            <Surface style={styles.pocket} key={pocket.id}>
              <View style={styles.pocketDetails}>
                <Text variant={"bodySmall"}>Name: {pocket.name}</Text>
                <Text variant={"bodySmall"}> {pocket.purpose}</Text>
                <Text variant={"bodySmall"}>Savings Plan: {pocket.expand.savings_tier.name}</Text>
                <Text variant={"bodySmall"}>Amount Saved: {pocket.expand.savings_tier.currency}{pocket.amount}</Text>
                <Text variant={"bodySmall"}>Goal: {pocket.expand.savings_tier.currency}{pocket.goal}</Text>
                <Text variant={"bodySmall"}>Interest: {pocket.expand.savings_tier.interest_rate * 100}% p.a</Text>
              </View>
              <View style={styles.buttonColumn}>
                <Button mode="contained" style={styles.button} onPress={() => handleTopUp(pocket)}>Top Up</Button>
                <Button mode="contained" style={styles.button} onPress={() => handleWithdraw(pocket)}>Withdraw</Button>
              </View>
            </Surface>
          ))}
          <Button mode="contained" onPress={() => setAddPocketVisible(true)}>Add New Pocket</Button>
        </Surface>
        <WalletSelectionModal
          visible={modalVisible}
          wallets={wallets.filter(wallet => wallet.currency === selectedPocket?.expand.savings_tier.currency)}
          onSelect={handleWalletSelect}
          onClose={() => setModalVisible(false)}
        />
        <Modal visible={addPocketVisible} transparent={true} animationType="slide">
          <AddPocket onClose={() => setAddPocketVisible(false)} />
        </Modal>
      </View>
    </SafeScreen>
  );
}

const privacyShieldImage: ImageSourcePropType = require('@/assets/images/save.png');

const ExplanationCard = () => {
  const [hidden, setHidden] = React.useState(false);
  console.log(hidden)
  return (
      !hidden && (
          <Card style={{ marginVertical: 10 }}>
            <Card.Cover style={{ width: "100%" }} source={privacyShieldImage} />
            <Card.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 5, marginTop: 5 }}>
                {"What is a Pocket?"}
              </Text>
              <Text variant="bodySmall">
                {"A Pocket is a sophisticated kind of wallet designed" +
                    " to give NexXers more control over their " +
                    "financial freedom, in tandem with Coin Exchange a NexXer " +
                    "can create pockets depending on the saving options given," +
                    "earn interest on these saving options."}
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
    // backgroundColor: '#f0f0f0',
    padding: 10,
  },
  surface: {
    padding: 20,
    margin: 10,
    borderRadius: 10,
    // backgroundColor: '#ffffff',
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pocket: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    // backgroundColor: '#ffffff',
    elevation: 2,
  },
  pocketDetails: {
    flex: 1,
  },
  buttonColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    marginVertical: 5,
  },
});