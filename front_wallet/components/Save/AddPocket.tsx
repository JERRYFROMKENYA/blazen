import React, { useState, useEffect } from 'react';
import { StyleSheet,  ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, Surface, ActivityIndicator , TextInput} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePocketBase } from '@/components/Services/Pocketbase';
import { useAuth } from '@/app/(auth)/auth';
import { useLoading } from '@/components/utils/LoadingContext';
import { View } from '@/components/Themed';

const AddPocket = ({ onClose }: { onClose: () => void }) => {
  const { pb } = usePocketBase();
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [goal, setGoal] = useState('');
  const [lockUntil, setLockUntil] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [savingTiers, setSavingTiers] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoadingState] = useState(true);

  useEffect(() => {
    const fetchSavingTiers = async () => {
      try {
        setLoading(true);
        const tiers = await pb.collection('savings_tiers').getFullList();
        setSavingTiers(tiers);
      } catch (error) {
        // console.error('Error fetching saving tiers:', error);
      } finally {
        setLoading(false);
        setLoadingState(false);
      }
    };

    const fetchWallets = async () => {
      try {
        setLoading(true);
        const userWallets = await pb.collection('wallet').getFullList({
          filter: `user = "${user.id}"`,
        });
        setWallets(userWallets);
      } catch (error) {
        // console.error('Error fetching wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavingTiers();
    fetchWallets();
  }, []);

  const handleAddPocket = async () => {
    if (!name || !purpose || !goal || !lockUntil || !selectedTier) {
      alert('Please fill in all fields');
      return;
    }

    const goalAmount = parseFloat(goal);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      alert('Please enter a valid goal amount');
      return;
    }

    const userWallet = wallets.find(wallet => wallet.currency === selectedTier.currency);
    if (!userWallet) {
      alert('You do not have a wallet with the corresponding currency. Please go to your profile and create one.');
      return;
    }

    if (userWallet.balance < selectedTier.min_amount) {
      alert('Insufficient balance to create this savings pocket.');
      return;
    }

    try {
      setLoading(true);
      await pb.collection('savings_pocket').create({
        user: user.id,
        name,
        purpose,
        goal: goalAmount,
        lock_until: lockUntil.toISOString(),
        savings_tier: selectedTier.id,
        amount: 1,
      });

      // Deduct the min_amount from the user's wallet
      await pb.collection('wallet').update(userWallet.id, {
        balance: userWallet.balance - selectedTier.min_amount,
      });

      alert('Savings pocket added successfully');
      onClose();
    } catch (error) {
      // console.error('Error adding savings pocket:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || lockUntil;
    setShowDatePicker(Platform.OS === 'ios');
    setLockUntil(currentDate);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <Text variant="titleMedium">Add New Savings Pocket</Text>
        <TextInput
          style={styles.input}
          placeholder="Pocket Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Purpose"
          value={purpose}
          onChangeText={setPurpose}
        />
        <TextInput
          style={styles.input}
          placeholder="Goal Amount"
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
            placeholder="Lock Until"
            value={lockUntil.toDateString()}
            editable={false}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={lockUntil}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        {loading ? (
          <ActivityIndicator animating={true} />
        ) : (
          <ScrollView style={styles.scrollView}>
            {savingTiers.map((tier) => (
              <TouchableOpacity
                key={tier.id}
                onPress={() => setSelectedTier(tier)}
              >
                <Surface
                  style={[
                    styles.tierSurface,
                    selectedTier?.id === tier.id && styles.selectedTier,
                  ]}
                >
                  <Text style={styles.tierTitle}>{tier.name} - {tier.currency}</Text>
                  <Text style={styles.tierDescription}>{tier.description}</Text>
                  <Text style={styles.tierInterest}>Interest Rate: {tier.interest_rate * 100}%</Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <Button mode="contained" onPress={handleAddPocket}>Add Pocket</Button>
        <Button onPress={onClose}>Cancel</Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  surface: {
    width: '90%', // Increased width
    padding: 30, // Increased padding
    borderRadius: 10,
    // backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  scrollView: {
    maxHeight: 250, // Increased max height
    marginBottom: 10,
  },
  tierSurface: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    // backgroundColor: '#f0f0f0',
  },
  selectedTier: {
    // backgroundColor: '#d0f0c0',
  },
  tierTitle: {
    fontWeight: 'bold',
  },
  tierDescription: {
    fontSize: 12,
    color: 'gray',
  },
  tierInterest: {
    fontSize: 12,
    color: 'green',
  },
});

export default AddPocket;