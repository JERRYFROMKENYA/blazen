import React from 'react';
import {ImageSourcePropType, StyleSheet} from 'react-native';
import {Button, Appbar, Card, Text, Icon} from 'react-native-paper';
import {View} from "@/components/Themed";
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import {useRouter} from "expo-router";

const MainScreen = () => {
  const router =useRouter();

  return (
    <View>
      <Appbar.Header>
        <Appbar.Action icon={"arrow-left"} onPress={()=>router.back()}/>
        <Appbar.Content title="Bill Split" />
      </Appbar.Header>
      <SafeScreen>
        <ExplanationCard/>
        <View style={styles.buttonContainer}>
        <Button style={{margin:10}} mode="contained" onPress={() => router.push('/split_bill/BillCreation')}>
          Create Bill
        </Button>
        <Button style={{margin:10}} mode="contained" onPress={() => router.push('/split_bill/JoinBill')}>
          Join Bill
        </Button>
        <Button style={{margin:10}} mode="contained" onPress={() => router.push('/split_bill/ManageBills')}>
          Manage Bills
        </Button>
    </View>

      </SafeScreen>
  </View>

  );
};


const privacyShieldImage: ImageSourcePropType = require('@/assets/images/bill_split.png');

const ExplanationCard = () => {
  const [hidden, setHidden] = React.useState(false);
  console.log(hidden)
  return (
      !hidden && (
          <Card style={{ marginVertical: 10 }}>
            <Card.Cover style={{ width: "100%" }} source={privacyShieldImage} />
            <Card.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 5, marginTop: 5 }}>
                {"What is Bill Split?"}
              </Text>
              <Text variant="bodySmall">
                {"Bill Split puts you more in control of how you " +
                    "split the bill with other NexXers, it allows" +
                    "the creation of multiple bills and an easy way to " +"" +
                    "share the bill with others. Don't worry, " +
                    "if a bill condition isn't fullfilled, you won't get charged. " +
                    "All Money goes to it's intended merchant and never handled by other NexXers."}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    justifyContent:"center",
    alignItems:"center"
  },
});

export default MainScreen;
