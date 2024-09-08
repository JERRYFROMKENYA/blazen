import {Chip, Surface, Text} from "react-native-paper";
import {View} from "@/components/Themed";
import { StyleSheet } from 'react-native';
import React from "react";


export default function TransactionsWidget() {
  return (
    <>
        <Surface style={styles.transactionsCard} elevation={2}>
            <View style={styles.balanceHeader}>
                <Text variant="titleSmall">Latest Transactions</Text>
            </View>
            <View style={styles.balanceHeader}>
                <Chip style={styles.chip} icon="check-decagram-outline" showSelectedOverlay showSelectedCheck rippleColor={"green"}  selected onPress={() => console.log('Pressed')}>Success</Chip>
                <Chip style={styles.chip} icon="alert-decagram" rippleColor={"yellow"}  selected onPress={() => console.log('Pressed')}>Pending</Chip>
                <Chip style={styles.chip} icon="alert-decagram" rippleColor={"red"}  selected onPress={() => console.log('Pressed')}>Failed</Chip>
            </View>
        </Surface>
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
    },
    gridContainer: {
        backgroundColor: 'transparent',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems:"flex-start",
        width: '100%',
    },
    gridRow: {
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:"flex-start",
        width: '50%',
    },
    ActionButtons: {
        fontSize: 40,
        width: '100%',
    },
    // ... other styles
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