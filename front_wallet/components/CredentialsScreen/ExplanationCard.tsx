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
            <Card style={{ marginVertical: 10 }}>
                <Card.Cover style={{ width: "100%" }} source={privacyShieldImage} />
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
                <Card.Actions>
                    <Button
                        style={{ alignSelf: "flex-end" }}
                        icon={() => <Icon size={20} source={"close"} />}
                        onPress={() => setHidden(!hidden)}
                    >
                        {"Close"}
                    </Button>
                </Card.Actions>

            </Card>
        )
    );
};

export default ExplanationCard;