import React from 'react';
import HomeScreen from './index';
import { BottomNavigation } from 'react-native-paper';
import CredentialScreen from "./three";
import Transactions from "@/app/(tabs)/two";
import { useAuth } from "@/app/(auth)/auth";

export default function TabLayout() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'creds', title: 'Credentials', focusedIcon: 'lock', unfocusedIcon: 'lock-outline' },
    { key: 'user', title: 'Transactions', focusedIcon: 'view-list', unfocusedIcon: 'view-list-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    creds: CredentialScreen,
    user: Transactions,
  });

  const { user, signOut } = useAuth();

  return (
    <>
      {user && (
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
        />
      )}
    </>
  );
}
