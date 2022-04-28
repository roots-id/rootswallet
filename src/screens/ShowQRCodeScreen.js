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

import {logger} from '../logging';
import QRCode from 'react-native-qrcode-svg';
import { prismLogo } from '../roots'
import styles from "../styles/styles";

export default function ShowQRCodeScreen({ route, navigation }) {
  logger("get qr code for", route.params.qrdata)

  const { colors } = useTheme();
  const { current } = useCardAnimation();

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
      <Animated.View
        style={{
          padding: 16,
          width: '90%',
          maxWidth: 400,
          borderRadius: 3,
          backgroundColor: colors.card,
          alignItems: 'center',
                  justifyContent: 'center',
          transform: [
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
      {route.params.qrdata.map(qr => (
        <QRCode
            value={ JSON.stringify(qr) }
            size={300}
            logo={require('../assets/ATALAPRISM.png')}
            logoSize={50}
            logoBackgroundColor='transparent'
            key="{qr}"
        />
        ))}
      </Animated.View>
    </View>
  );
}