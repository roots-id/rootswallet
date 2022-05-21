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
import { credLogo, decodeCredential, getShareableCred,isShareable } from '../credentials'
import { getImportedCredByHash, verifyCredential } from '../roots'
import * as utils from '../utils'

import IconActions from '../components/IconActions';

export default function CredentialDetailScreen({ route, navigation }) {
    console.log("cred details - route params are",JSON.stringify(route.params))
    const [cred, setCred] = useState(route.params.cred);
    const { colors } = useTheme();
    const { current } = useCardAnimation();

    useEffect(() => {
        console.log("cred details - initially setting cred",cred)
        setCred(route.params.cred)
    }, []);

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
            icon="check-bold"
            size={36}
            color="#e69138"
            onPress={() => verifyCredential(cred.verifiedCredential.proof.hash.toString())}
          />
          <IconButton
            icon="qrcode"
            size={36}
            color="#e69138"
            onPress={() => showQR(navigation,cred)}
          />
          <IconButton
              icon="close-circle"
              size={36}
              color="#e69138"
              onPress={() => navigation.goBack()}
          />
        </View>
        <Image source={credLogo}
            style={{
              width: '30%',
              height: '30%',
              resizeMode:'contain',
              margin:8,
              justifyContent:'flex-start',
            }}
        />
        <Text style={styles.subText}>Credential:</Text>
        <Text style={styles.subText}>From:</Text>
        <Text style={styles.subText}>Last Verified:</Text>
        <Text style={styles.subText}>Value:</Text>
        <Text style={styles.subText}>{utils.recursivePrint(JSON.stringify(cred))}</Text>
      </Animated.View>
    </View>
    );
}