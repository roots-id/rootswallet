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
    View, ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';

import {logger} from '../logging';
import { Divider, IconButton, List, Title,ToggleButton } from 'react-native-paper';
import styles from "../styles/styles";

import RelRow from '../components/RelRow'
import { credLogo, verifyCredentialByHash } from '../credentials'
import { showQR } from '../qrcode'
import * as roots from '../roots'
import * as utils from '../utils'


export default function CredentialDetailScreen({ route, navigation }) {
    console.log("cred details - route params are",JSON.stringify(route.params))
    const [cred, setCred] = useState(route.params.cred);
    const [verified, setVerified] = useState("help-circle");
    const { colors } = useTheme();
    const { current } = useCardAnimation();

    useEffect(() => {
        console.log("cred details - initially setting cred",cred)
        setCred(route.params.cred)
    }, []);

    async function updateVerification() {
        const result = JSON.parse(await verifyCredentialByHash(cred.hash,roots.getRootsWallet(roots.TEST_WALLET_NAME)));
        logger("cred details - verify cred result",result)
        if(result && result.length <= 0) {
            setVerified("check-bold")
        } else if(result && result.length > 0) {
            setVerified("alert-octagon")
        } else {
            setVerified("help-circle")
        }
    }
//        <RelRow rel={getShareableRelByAlias(cred.decoded.id)} nav={navigation}/>
//        <Text style={styles.subText}>Last Verified: "Not verified"</Text>
//          <Text style={styles.subText}>From: </Text>
//          <Text style={styles.subText}>To: {cred.decoded.credentialSubject.id}</Text>
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
            icon={verified}
            size={36}
            color="#e69138"
            onPress={async () => updateVerification()}
          />
          <IconButton
            icon="qrcode"
            size={36}
            color="#e69138"
            onPress={() => showQR(navigation,cred.encoded)}
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
              <FlatList
                  data={Object.keys(cred.decoded.credentialSubject)}
                  keyExtractor={(item) => item}
                  ItemSeparatorComponent={() => <Divider />}
                  renderItem={({ item }) =>
                      {
                        const output = utils.recursivePrint(cred.decoded.credentialSubject[item])
                        console.log(item,": ",output)
                        return           <ScrollView style={{
                            padding: 16,
                            width: '90%',
                            maxWidth: 450,
                            maxHeight: 150,
                            borderRadius: 3,
                            backgroundColor: colors.card,}}><Text style={{color: "black"}}>{item + ": " + output}</Text></ScrollView>
                      }
                  }
              />
      </Animated.View>
    </View>
    );
}