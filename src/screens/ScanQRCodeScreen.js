import { useEffect, useState } from 'react';
import {
  Animated,
  View,
  Text,
  Pressable,
  Button,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';
import { BarCodeScanner } from 'expo-barcode-scanner';

import {logger} from '../logging';
import { prismLogo } from '../roots'
//import styles from "../styles/styles";

export default function ScanQRCodeScreen({ route, navigation }) {
  logger("scan qr code - ")
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const { colors } = useTheme();
  const { current } = useCardAnimation();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pressable
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        ]}
        onPress={navigation.goBack}
      />
        <View style={{

        alignItems: 'center',
        justifyContent: 'center',
                          width: 250,
                          height: 250,
                        }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
    </View>
  );
}