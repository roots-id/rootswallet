import React from 'react';
import {Button, StyleSheet, View, Text, NativeModules} from 'react-native';
import { useTranslation } from 'react-i18next'
import '../../localization'
const { PrismModule, PeerDidModule } = NativeModules;

const MyIdentityScreen = (props) => {
    console.log(`Entering MyIdentity screen`);
    const { t, i18n } = useTranslation()

    const onPressPrism = () => {
        console.log('DID: ' + PrismModule.createDID('passphrase'));
      };
      const onPressPeer = () => {
        console.log('DID: ' + PeerDidModule.createDID(1,1,null));
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
        </View>
    );
};

export default MyIdentityScreen