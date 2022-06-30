import React, { useEffect, useState } from 'react';
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
import { IconButton, ToggleButton } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { prismLogo } from '../roots'
import styles from "../styles/styles";

export default function ShowQRCodeScreen({ route, navigation }) {
    logger("get qr code for", route.params.qrdata)
    const qrView = 1
    const textView = 2
    const [viewSelection, setViewSelection] = useState(qrView)
    const [viewIcon, setViewIcon] = useState("toggle-switch")
    const [viewOut, setViewOut] = useState(<Text>Nothing to show</Text>);
    const { colors } = useTheme();
    const { current } = useCardAnimation();

    const onButtonToggle = value => {
        setViewSelection(viewSelection === qrView ? textView : qrView);
    };

    useEffect(() => {
        switch(viewSelection) {
            case qrView:
                setViewOut(<QRCode
                    value={ route.params.qrdata }
                    size={300}
                    logo={require('../assets/ATALAPRISM.png')}
                    logoSize={50}
                    logoBackgroundColor='transparent'
                    key="{qr}"
                />)
                setViewIcon("toggle-switch")
                break;
            case textView:
                setViewOut(<Text>{ route.params.qrdata }</Text>)
                setViewIcon("toggle-switch-off-outline")
                break;
            default:
                console.error("Unknown view",viewSelection)
                break;
        }
    }, [viewSelection]);

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
      <IconButton
          icon="close-circle"
          size={36}
          color="#5b3a70"
          onPress={() => navigation.goBack()}
      />
      <ToggleButton
            icon={viewIcon}
            value="toggle view switch"
            status={viewSelection}
            onPress={onButtonToggle}
          />
      {viewOut}
      </Animated.View>
    </View>
  );
}