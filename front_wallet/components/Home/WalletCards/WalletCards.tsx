import { Button, Icon, Surface, Text } from "react-native-paper";
import { View } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useAuth } from "@/app/(auth)/auth";
import { getWalletsForLoggedInUser } from "@/components/utils/wallet_ops";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { formatNumberWithCommas } from "@/components/utils/format";
import { useRouter } from 'expo-router';
import { useLoading } from "@/components/utils/LoadingContext";

export default function WalletCards() {
  const router = useRouter();
  const { user } = useAuth();
  const [wallets, setWallets] = useState([{ currency: "KES", balance: 0, provider: "NexX" }]);
  const [currentWalletIndex, setCurrentWalletIndex] = useState(0);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const { pb } = usePocketBase();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getWalletsForLoggedInUser(user, pb).then(r => {
      setWallets(r);
      setLoading(false);
    });
  }, [user, pb, router]);

  const handleNextWallet = () => {
    setCurrentWalletIndex((prevIndex) => (prevIndex + 1) % wallets.length);
  };

  const handlePreviousWallet = () => {
    setCurrentWalletIndex((prevIndex) => (prevIndex - 1 + wallets.length) % wallets.length);
  };

  const WalletCard = (props: any) => {
    return (
      <Surface style={styles.balanceCard} elevation={3}>
        <View style={styles.balanceHeader}>
          <Text variant="titleMedium">Balance</Text>
          <Button icon={() => <Icon name="eye" size={20} />} onPress={() => setIsBalanceHidden(!isBalanceHidden)}>
            {isBalanceHidden ? "Show" : "Hide"}
          </Button>
        </View>
        {(!isBalanceHidden) ? (
          <>
            <Text variant="titleLarge">{props.currency || ""} {formatNumberWithCommas(props?.balance || 0)}</Text>
            <Text variant="bodyMedium">{props.provider}</Text>
          </>
        ) : (
          <Text variant="titleLarge">*****</Text>
        )}
      </Surface>
    );
  };

  const currentWallet = wallets[currentWalletIndex];

  return (
    <ScrollView
      style={{
        flexDirection: "row",
        width: "100%",
      }}>
      {
        wallets.map((wallet, index) => {
          return <WalletCard key={index} currency={wallet.currency} provider={wallet.provider} balance={wallet.balance} />
        })
      }
    </ScrollView>
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
    width: '50%',
    padding: 20,
    borderRadius: 10,
    paddingTop: 10,
    alignSelf: 'center',
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