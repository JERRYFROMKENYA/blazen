import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import AuthScreen from "./login";

const Stack = createStackNavigator();

export default function AuthLayout() {
  return (
    <PaperProvider>
      <NavigationContainer
          independent={true}>
        <Stack.Navigator
        >
          <Stack.Screen name="AuthScreen" component={AuthScreen} options={{ headerShown: false }} />
          {/*<Stack.Screen name="SignUp" component={SignUp} options={{ presentation: "transparentModal", title: "Register" }} />*/}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}