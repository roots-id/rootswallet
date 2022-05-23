import React, { useEffect, useState } from 'react';
import {
  Animated,
  Button,
  FlatList,
  Image,
  Text,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import { useCardAnimation } from '@react-navigation/stack';

import {logger} from '../logging';
import { Divider, IconButton, List, Title,ToggleButton } from 'react-native-paper';
import styles from "../styles/styles";

import * as roots from '../roots'

import IconActions from '../components/IconActions';

export default function RelationshipDetailScreen({ route, navigation }) {
    const [host, setHost] = useState(roots.getPrismHost());
    const { colors } = useTheme();
    const { current } = useCardAnimation();

    useEffect(() => {
        roots.setPrismHost(host)
    }, [host]);

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
      alignItems: 'center',
      padding: 16,
      width: '90%',
      borderRadius: 3,
      backgroundColor: "#bfafba",
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
      <View style={{flexDirection:'row',}}>
        <IconButton
          icon="chemical-weapon"
          size={36}
          color="#e69138"
          onPress={() => navigation.navigate("Integration")}
        />
        <IconButton
          icon="close-circle"
          size={36}
          color="#e69138"
          onPress={() => navigation.goBack()}
        />
      </View>
        <Text style={{fontSize: 18}}>Select Prism Node:</Text>
        <View style={{backgroundColor: '#251520',width: "80%"}}>
        <Picker
          style={styles.clickableListTitle}
          mode="dropdown"
          dropdownIconColor="#e69138"
          numberOfLines={5}
          selectedValue={host}
          onValueChange={(itemValue) => setHost(itemValue)}>
          <Picker.Item label="Local Test Node" value="ppp-node-test.atalaprism.io"/>
          <Picker.Item label="Prism Test Net Node" value="ppp.atalaprism.io"/>
        </Picker>
        </View>
      </Animated.View>
    </View>
  );
}