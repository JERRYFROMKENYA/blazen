import {Text, View, Modal} from "@/components/Themed";
import {Platform, StyleSheet} from "react-native";
import {Button,  PaperProvider, Portal} from "react-native-paper";
import React from "react";



export default function SendMoneyAction({details,visible,hide}:{details:any,visible:boolean,hide:()=>void}) {


    const containerStyle = {backgroundColor: 'gray', padding: 40, width:"95%"};




    // @ts-ignore
    return(
        <>

                <Portal>
                    <Modal visible={visible} onDismiss={hide} contentContainerStyle={containerStyle}>

                            <Text>
                                {details.recipient}
                                -{"\n"}
                                {details.amount}
                                -{"\n"}
                                {details.selectedOffering.split(":")[0]}
                                -{"\n"}
                                {details.selectedOffering.split(":")[1]}
                                -{"\n"}
                                {/*{details.walletInUse}*/}
                                -{"\n"}
                                {String(JSON.stringify(details?.walletInUse?.id ||""))}
                            </Text>

                    </Modal>
                </Portal>

        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
});