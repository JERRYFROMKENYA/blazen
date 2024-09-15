import { Chip, Surface, Text, List } from "react-native-paper";
import { View } from "@/components/Themed";
import {Image, StyleSheet} from 'react-native';
import React, { useEffect, useState } from "react";
import { usePocketBase } from '@/components/Services/Pocketbase';
import { useAuth } from "@/app/(auth)/auth";
import { useRouter } from "expo-router";

export default function TransactionsWidget() {
  const { pb } = usePocketBase();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [did, setDid] = useState("loading...");
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const getDid = async () => {
      const did = await pb.collection('customer_did').getFirstListItem(`user = "${user.id}"`, {
        sort: 'updated',
      });
      setDid(did.did);
      console.log(did);

      const fetchTransactions = async () => {
        const result = await pb.collection('customer_quotes').getList(1, 5, {
          filter: `rfq.metadata.from = "${did.did.uri}"`,
          sort: '-created',
          expand: 'pfi'
        });
        setTransactions(result.items);
      };
      fetchTransactions();
    }

    getDid()
  }, [pb]);

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === "all") return true;
    return transaction.status === filter;
  });

  return (
    <>
      <Surface style={styles.transactionsCard} elevation={2}>
        <View style={styles.balanceHeader}>
          <Text variant="titleSmall">Latest Transactions</Text>
        </View>
        <View style={styles.balanceHeader}>
          <Chip
            style={styles.chip}
            icon="check-decagram-outline"
            selected={filter === "completed"}
            showSelectedCheck={true}
            onPress={() => setFilter("completed")}
          >
            Success
          </Chip>
          <Chip
            style={styles.chip}
            icon="alert-decagram"
            selected={filter === "pending"}
            showSelectedCheck={true}
            onPress={() => setFilter("pending")}
          >
            Pending
          </Chip>
          <Chip
            style={styles.chip}
            icon="close-circle"
            selected={filter === "cancelled"}
            showSelectedCheck={true}
            onPress={() => setFilter("cancelled")}
          >
            Failed
          </Chip>
          <Chip
            style={styles.chip}
            icon="filter-outline"
            selected={filter === "all"}
            showSelectedCheck={true}
            onPress={() => setFilter("all")}
          >
            All
          </Chip>
        </View>
        <List.Section>
          {filteredTransactions.length === 0 ? (
            <Text>No transactions yet</Text>
          ) : (
            filteredTransactions.map((transaction) => (
              <List.Item
                onPress={() => router.push(`/exchange-details/${transaction.exchangeId}`)}
                key={transaction.id}
                title={transaction.expand.pfi.name}
                description={`Amount: ${transaction.rfq.data.payin.currencyCode} ${transaction.rfq.data.payin.amount}\nDate: ${new Date(transaction.created).toLocaleString()}`}
                left={props => <List.Icon {...props} icon={transaction.status === 'completed' ? 'check' : transaction.status === 'pending' ? 'alert' : 'close'} />}
              />
            ))
          )}
        </List.Section>
      </Surface>
        <Image
            source={require('@/assets/images/adaptive-icon.png')}
            style={{ width: 200, height: 50, marginBottom: 20, alignSelf: "center" }}
        />
    </>
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
    borderRadius: 30,
    paddingTop: 10,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'transparent',
    flexWrap: "wrap"
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
    marginBottom: 20,
  },
});