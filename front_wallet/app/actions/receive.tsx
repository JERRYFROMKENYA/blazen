import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet,  Alert } from 'react-native';
import {Text, Menu, Provider, Button, Icon} from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import {View} from '@/components/Themed';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function ModalScreen() {
  const [action, setAction] = useState('');
  const [visible, setVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const walletInfo = 'Your wallet information here';

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleBarCodeScanned = ({ type, data }:{type:any;data:any}) => {
    setScanned(true);
    setScannerVisible(false);
    Alert.alert('QR Code Scanned', `Type: ${type}\nData: ${data}`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Receive Money</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button icon={()=>{return <Icon source={"chevron-down"} size={20}/>;}} children={action || 'Select Action'} onPress={openMenu} />}>
          <Menu.Item onPress={() => { setAction('Receive Money'); closeMenu(); }} title="Receive Money" />
          <Menu.Item onPress={() => { setAction('Scan QR Code'); setScannerVisible(true);  closeMenu(); }} title="Scan QR Code" />
        </Menu>

        {action === 'Receive Money' && (
            <View style={{ padding:10,backgroundColor:"white"}}>
          <QRCode value={walletInfo} size={200}

          />
            </View>
        )}

        {action === 'Scan QR Code' && scannerVisible && (
            <>
              <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={StyleSheet.absoluteFillObject}
              />
              {scanned && <Button children={'Tap to Scan'} onPress={() => { setScanned(false); setScannerVisible(true); }} />}
            </>
        )}

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </>
  );
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