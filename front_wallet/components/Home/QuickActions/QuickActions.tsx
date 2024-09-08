import {Button, Chip, Icon, Surface, Text} from "react-native-paper";
import {View} from "@/components/Themed";
import React from "react";
import {StyleSheet} from "react-native";
import {useRouter} from "expo-router";


export default function QuickActions(){
    const router =useRouter();
    return(
        <Surface style={styles.balanceCard} elevation={0}>
            <View style={styles.balanceHeader}>
                <Text variant="titleMedium">Quick Actions</Text>
            </View>
            <View style={styles.gridContainer}>
                <View style={styles.gridRow}>
                    <Chip style={styles.chip} icon="plus-circle"  selected onPress={() => router.push('/actions/deposit_money')}>Deposit</Chip>
                    <Chip style={styles.chip} icon="minus-circle"  selected onPress={() => console.log('Pressed')}>Withdraw</Chip>
                    <Chip icon="call-split" onPress={() => console.log('Pressed')}>Bill Split</Chip>
                </View>
                <View style={styles.gridRow}>
                    <Chip style={styles.chip} icon="send-circle"  selected onPress={() => router.push("/actions/send_money")}>Send</Chip>
                    <Chip style={styles.chip} icon="call-received"  selected onPress={() => router.push("/actions/receive")}>Receive</Chip>
                    <Chip icon="contactless-payment" onPress={() => console.log('Pressed')}>Pay</Chip>

                </View>
                <View style={{...styles.gridRow, justifyContent: 'center',
                    alignItems:"center",}}>
                    {/*<Chip icon="information" onPress={() => console.log('Pressed')}>Pay</Chip>*/}
                    <Chip icon="piggy-bank" onPress={() => console.log('Pressed')}>Save</Chip>

                </View>
            </View>
        </Surface>
    )
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
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 20,
        borderRadius: 30,
        paddingTop: 10,
    },
    balanceHeader: {
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
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
        width: '100%',
    },
    ActionButtons: {
        fontSize: 40,
        width: '100%',
    },
    // ... other styles
    chip: {
       alignItems: 'flex-start',
        margin: 4,
        fontSize: 12,
        width:110
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