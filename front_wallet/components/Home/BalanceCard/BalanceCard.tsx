import { Button, Icon, Surface, Text } from "react-native-paper";
import { View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useAuth } from "@/app/(auth)/auth";
import { getWalletsForLoggedInUser } from "@/components/utils/wallet_ops";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { formatNumberWithCommas } from "@/components/utils/format";

export default function BalanceCard() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState([{ currency: "KES", balance: 0}]);
  const [currentWalletIndex, setCurrentWalletIndex] = useState(0);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const { pb } = usePocketBase();

  useEffect(() => {
    if (!user) return;
    getWalletsForLoggedInUser(user, pb).then(r => setWallets(r));
  }, [user, pb]);

  const handleNextWallet = () => {
    setCurrentWalletIndex((prevIndex) => (prevIndex + 1) % wallets.length);
  };

  const handlePreviousWallet = () => {
    setCurrentWalletIndex((prevIndex) => (prevIndex - 1 + wallets.length) % wallets.length);
  };

  const currentWallet = wallets[currentWalletIndex];

  return (
    <Surface style={styles.balanceCard} elevation={3}>
      <View style={styles.balanceHeader}>
        <Text variant="titleMedium">Balance</Text>
        <Button icon={() => <Icon source="eye" size={20} />} onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
          {isBalanceHidden ? "Show" : "Hide"}
        </Button>
      </View>
      {currentWallet && !isBalanceHidden && (
        <>
          <Text variant="titleLarge">{currentWallet.currency} {formatNumberWithCommas(currentWallet.balance)}</Text>
          {wallets.length > 1 && (
            <View style={styles.walletNavigation}>
              <Button onPress={handlePreviousWallet}>{"< Previous"}</Button>
              <Button onPress={handleNextWallet}>{"Next >"}</Button>
            </View>
          )}
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  balanceCard: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    paddingTop: 10,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'transparent',
  },
  walletNavigation: {
      backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  gridContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: "flex-start",
    width: '100%',
  },
  gridRow: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "flex-start",
    width: '50%',
  },
  ActionButtons: {
    fontSize: 40,
    width: '100%',
  },
  chip: {
    height: 30,
    margin: 4,
    fontSize: 12,
  },
  transactionsCard: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    paddingTop: 10,
  },
});