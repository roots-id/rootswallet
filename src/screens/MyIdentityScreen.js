import React from 'react';
import {Button, StyleSheet, View, Text, NativeModules} from 'react-native';
import { useTranslation } from 'react-i18next'
import '../../localization'
import { randomBytes } from 'react-native-randombytes'
import { X25519KeyPair } from '@transmute/did-key-x25519';
import { Ed25519KeyPair } from '@transmute/did-key-ed25519';
const { PrismModule, PeerDidModule } = NativeModules;

const MyIdentityScreen = (props) => {
    console.log(`Entering MyIdentity screen`);
    const { t, i18n } = useTranslation()

    const generateKeyPair = async(type) => {
        let keyGenerator = Ed25519KeyPair;
        if (type == 'x25519') {keyGenerator = X25519KeyPair}
        const keyPair = await keyGenerator.generate({
          secureRandom: () => randomBytes(32)
        });
        const { publicKeyJwk, privateKeyJwk } = await keyPair.export({
            type: 'JsonWebKey2020',
            privateKey: true,
          });
        return {
          publicJwk: publicKeyJwk,
          privateJwk: privateKeyJwk
        };
      }

    const onPressPrism = () => {
        console.log('DID: ' + PrismModule.createDID('passphrase'));
      };
    const onPressPeer = async() => {
        const authKey = await generateKeyPair('ed25519')
        const agreemhKey = await generateKeyPair('x25519')
        console.log('DID: ' + PeerDidModule.createDID(authKey.publicJwk,agreemhKey.publicJwk,null,null));
      };
    const onPressResolvePeer = async() => {
        console.log('DID doc: ' + PeerDidModule.resolveDID('did:peer:2.Ez6LSsa4YWzWPud89mY2Q2ee7RcKDEHkz3B1KWpgRpvjSe1uz.Vz6MkuJe3ajkA44hysX6ZmjzCWqQR9gFye3S8m1Ms8GTtXfFD'));
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