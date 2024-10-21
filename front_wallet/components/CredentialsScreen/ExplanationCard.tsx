import * as React from 'react';
import { Avatar, Button, Card, Icon, Text } from 'react-native-paper';
import { ImageSourcePropType } from 'react-native';

// Correct the import path for the image
const privacyShieldImage: ImageSourcePropType = require('@/assets/images/privacy_shield.png');

const ExplanationCard = () => {
    const [hidden, setHidden] = React.useState(false);
    console.log(hidden)
    return (
        !hidden && (
            <Card style={{ marginVertical: 10, width:"95%", alignSelf:"center" }}>

                <Card.Content>
                    <Text variant="bodyMedium" style={{ marginBottom: 5, marginTop: 5 }}>
                        {"What is a Verifiable Credential?"}
                    </Text>
                    <Text variant="bodySmall">
                        {"A Verifiable Credential is a tamper-proof, digitally signed document " +
                        "that contains information about you. It can be used to prove your identity or " +
                        "qualifications to anyone who needs to know."}
                    </Text>
                </Card.Content>
                <Card.Cover style={{ marginTop:20,width: "100%" }} source={privacyShieldImage} />


            </Card>
        )
    );
};

export default ExplanationCard;