import React from 'react';
import HomeScreen from './index';
import { BottomNavigation } from 'react-native-paper';
import TabTwoScreen from "@/app/(tabs)/two";
import {useRouter} from "expo-router";
import {useAuth} from "@/app/(auth)/auth";

export default function TabLayout() {
  const router =useRouter();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'user', title: 'Me', focusedIcon: 'account-circle', unfocusedIcon: 'account-circle-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    user: TabTwoScreen,
  });



  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}
