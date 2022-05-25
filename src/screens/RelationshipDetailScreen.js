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
import { useCardAnimation } from '@react-navigation/stack';

import {logger} from '../logging';
import { Divider, IconButton, List, Title,ToggleButton } from 'react-native-paper';
import styles from "../styles/styles";

import { showQR } from '../qrcode'
import { getShareableRelByAlias,isShareable, YOU_ALIAS } from '../relationships'
import { getChatsByRel } from '../roots'

import IconActions from '../components/IconActions';

export default function RelationshipDetailScreen({ route, navigation }) {
    console.log("route params are",JSON.stringify(route.params))
    const [shareableRel, setShareableRel] = useState({});
    const { colors } = useTheme();
    const { current } = useCardAnimation();

    useEffect(() => {
        if(!isShareable(route.params.rel)) {
            setShareableRel(getShareableRelByAlias(route.params.rel))
        } else {
            setShareableRel(route.params.rel)
        }
    }, []);

    useEffect(() => {
        console.log("rel changed",shareableRel)
    }, [shareableRel]);

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
          maxWidth: 500,
          borderRadius: 3,
          backgroundColor: colors.card,
          alignItems: 'center',
                  justifyContent: 'flex-start',
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
            icon="qrcode"
            size={36}
            color="#e69138"
            onPress={() => showQR(navigation,shareableRel)}
          />
          <IconButton
              icon="close-circle"
              size={36}
              color="#e69138"
              onPress={() => navigation.goBack()}
          />
        </View>
        <Image source={shareableRel.displayPictureUrl}
            style={{
              width: '30%',
              height: '30%',
              resizeMode:'contain',
              margin:8,
              justifyContent:'flex-start',
            }}
        />
        <Text style={styles.subText}>{shareableRel.displayName}</Text>
        <Divider/>
        <Text style={styles.subText}>{shareableRel.did}</Text>
      </Animated.View>
    </View>
  );
}