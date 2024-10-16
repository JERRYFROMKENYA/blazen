import * as React from 'react';
import {Chip, Surface, Text, Menu, IconButton, Icon, Button} from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { format } from 'date-fns';
import {View} from "@/components/Themed";

interface propsType{
    issuer: string;
    dateIssued: string;
    properties: { [key: string]: string };
    vc: string;
    purpose: string;
    onDelete: () => void;
    exportVc: () => void;
    showQrCode: () => void;
    // Add onDelete prop
}
const CredentialsCard = ({issuer, dateIssued, properties, vc, purpose, onDelete, exportVc, showQrCode}: propsType) => {
    const [menuVisible, setMenuVisible] = React.useState(false);
    const formattedDate = format(new Date(dateIssued), 'PPPpp');
    const toSentenceCase = (str: string) => {
        if (!str) return str;
        if (str.toLowerCase() === 'did') return 'DID';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
        <Surface style={styles.surface} elevation={4}>
            <View style={styles.header}>
                <View style={{justifyContent:"center",
                    padding:0,
                    backgroundColor:"transparent",
                    margin:0,
                    flexDirection:"row"}}>
                    <Icon size={28} source="check-decagram" />
                    <Text variant={"headlineSmall"}>{" "}</Text>
                    <Text variant={"headlineSmall"}>{issuer}</Text>
                </View>

            </View>
            <Text>Partial Verifiable Credential: {vc.slice(-12,-1)}</Text>
            <Text>Used for {purpose}</Text>

            <Text variant={"bodySmall"}>Information Verified:</Text>
            <View style={{backgroundColor:"transparent", flexDirection:"row"}}>
                {Object.keys(properties).map((key) => (
                    <Chip style={{borderRadius:10, margin:5}} key={key}>💳 {toSentenceCase(properties[key])}</Chip>
                ))}
            </View>
            <View style={{
                flexDirection:"row",
                justifyContent:"space-evenly",
                backgroundColor:"transparent",
                alignSelf:"flex-end",
                padding:0,
                margin:0,
                width:100,
                height:50
            }}>
                <Button icon={()=> {
                    return(<Icon size={28} source={"file-export"}/>)
                } } onPress={() => exportVc()}>{""}</Button>
                <Button icon={()=> {
                    return(<Icon size={28} source={"qrcode"}/>)
                } } onPress={() => showQrCode()}>{""}</Button>
                <Button icon={()=> {
                    return(<Icon size={28} source={"delete"}/>)
                } } onPress={() => onDelete()}>{""}</Button>

            </View>
            <Text variant={"bodySmall"} style={{alignSelf:"flex-end"}}> Issued On : {formattedDate}</Text>
        </Surface>
    )
};

export default CredentialsCard;

const styles = StyleSheet.create({
    surface: {
        padding: 10,
        height: "auto",
        width: "95%",
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderRadius:10,
        alignSelf: 'center',
        margin:10,
    },
    header: {
        backgroundColor:"transparent",
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});