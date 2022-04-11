import React from 'react';
import {Button, StyleSheet, View, Text, NativeModules} from 'react-native';
import { useTranslation } from 'react-i18next'
import '../../localization'
import { randomBytes } from 'react-native-randombytes'
const { PrismModule, PeerDidModule } = NativeModules;
const ed25519 = require('@transmute/did-key-ed25519');

const MyIdentityScreen = (props) => {
    console.log(`Entering MyIdentity screen`);
    const { t, i18n } = useTranslation()

    const generateKeyPair = async() => {
        let keyGenerator = ed25519.Ed25519KeyPair;
        const keyPair = await keyGenerator.generate({
          secureRandom: () => randomBytes(32)
        });
        const { publicKeyJwk, privateKeyJwk } = await keyPair.export({type:'JsonWebKey2020'});
        return {
          publicJwk: publicKeyJwk,
          privateJwk: privateKeyJwk
        };
      }

    const onPressPrism = () => {
        console.log('DID: ' + PrismModule.createDID('passphrase'));
      };
    const onPressPeer = async() => {
        const authKey = await generateKeyPair()
        console.log(authKey)
        console.log('DID: ' + PeerDidModule.createDID(authKey.publicJwk));
      };
    const onPressResolvePeer = async() => {
        console.log('DID doc: ' + PeerDidModule.resolveDID('did:peer:0z6MkgXiKDNMeGMx8q4FSWm8f28xGZ4Vv7dWkJT17Gz9hMp7n'));
      };

    return (
        <View>
            <Text>MyIdentity</Text>
            <Button
                title={t('MyIdentityScreen.GenerateDIDPrismButton')}
                color='#841584'
                onPress={onPressPrism}
            />
            <Button
                title={t('MyIdentityScreen.GenerateDIDPeerButton')}
                color='#841584'
                onPress={onPressPeer}
            />
                        <Button
                title='Resolve DID Peer'
                color='#841584'
                onPress={onPressResolvePeer}
            />
        </View>
    );
};

export default MyIdentityScreen