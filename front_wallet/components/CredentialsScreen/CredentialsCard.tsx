import * as React from 'react';
import {Chip, Surface, Text, Menu, IconButton, Icon} from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { format } from 'date-fns';
import {View} from "@/components/Themed";

interface propsType{
    issuer: string;
    dateIssued: string;
    properties: { [key: string]: string };
    vc: string;
    purpose: string;
    onDelete: () => void; // Add onDelete prop
}
const CredentialsCard = ({issuer, dateIssued, properties, vc, purpose, onDelete}: propsType) => {
    const [menuVisible, setMenuVisible] = React.useState(false);
    const formattedDate = format(new Date(dateIssued), 'PPPpp');
    const toSentenceCase = (str: string) => {
        if (!str) return str;
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
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <IconButton
                            icon="dots-vertical"
                            onPress={() => setMenuVisible(true)}
                        />
                    }
                >
                    <Menu.Item onPress={onDelete} title="Delete" />
                </Menu>
            </View>
            <Text>Partial Verifiable Credential: {vc.slice(-12,-1)}</Text>
            <Text>Used for {purpose}</Text>
            <Text variant={"bodySmall"}>Information Verified:</Text>
            <View style={{backgroundColor:"transparent", flexDirection:"row"}}>
                {Object.keys(properties).map((key) => (
                    <Chip style={{borderRadius:10, margin:5}} key={key}>💳 {toSentenceCase(properties[key])}</Chip>
                ))}
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
        width: "100%",
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderRadius:10
    },
    header: {
        backgroundColor:"transparent",
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});