import React, {useEffect, useState} from 'react';
import {FlatList, Image, SafeAreaView, View, TouchableOpacity} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {
    addRefreshTrigger,
    credLogo,
    decodeCredential,
    getImportedCreds, getIssuedCreds,
    hasNewCred, isIssuedCred, issuedCredLogo
} from '../credentials'
import * as roots from '../roots'
import {styles} from "../styles/styles";
import * as wallet from '../wallet'
import {credential} from "../models";
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import * as utils from "../utils";
import { getItem, getItems } from '../store';

const DemoCredentialCredentialsScreen = ({route, navigation}: CompositeScreenProps<any, any>) => {
    console.log("alex creds screen - params", route.params)
    const [refresh, setRefresh] = useState(true)
    const [creds, setCreds] = useState<any[]>()

    // useEffect(() => {
    //     addRefreshTrigger(() => {
    //         console.log("alex cred screen - toggling refresh")
    //         const creds2 = getItems(new RegExp('demo_*'))
    //         console.log('creds2', creds2)
    //         let _creds = []
    //         let _jff = getItem('demo_jffcredential')
    //         if (_jff) {
    //             _creds.push(JSON.parse(_jff))
    //         }

    //         let _iiw = getItem('demo_iiwcredential')
            
    //         if (_iiw) {
    //             _creds.push(JSON.parse(_iiw))
    //         }
    //         console.log("typeof creds", typeof(_creds))
    //         if (_creds) {
    //             setCreds(_creds)
    //             // console.log("alex creds screen --alex --", _creds)
    //             setRefresh(!refresh)
    //         }
    //     })
    //     hasNewCred()
    // }, [])

    useEffect(() => {
        const interval = setInterval(async () => {
            console.log("alex cred screen - toggling refresh")
            const creds2 = getItems(new RegExp('demo_*'))
            console.log('creds2', creds2)
            let _creds = []
            let _jff = getItem('demo_jffcredential')
            if (_jff) {
                _creds.push(JSON.parse(_jff))
            }

            let _iiw = getItem('demo_iiwcredential')
            
            if (_iiw) {
                _creds.push(JSON.parse(_iiw))
            }
            console.log("typeof creds", typeof(_creds))
            if (_creds) {
                setCreds(_creds)
            }

        }, 1000);
        return () => clearInterval(interval);
    }, []);




    function renderCredRow(cred: any) {
        // console.log('alex renderCredRow', cred.credentialSubject)

        const avatar =
            <SafeAreaView>
            <TouchableOpacity
                onPress={() => navigation.navigate('Display Custom Credential', {credential: cred})}
                >
            <Image source={{uri: cred.credentialSubject?.achievement?.image?.id ? cred.credentialSubject.achievement.image.id : cred.credentialSubject.image}}
                   style={styles.credLogoStyle}
            />
            </TouchableOpacity>
            </SafeAreaView>

        const listItem =
            <SafeAreaView style={styles.container}>
            <List.Item
                title={cred.name ? cred.name : cred.credentialSubject.type}
                titleNumberOfLines={1}
                titleStyle={styles.clickableListTitle}
                descriptionStyle={styles.listDescription}
                descriptionNumberOfLines={1}
                onPress={() => navigation.navigate('Display Custom Credential', {credential: cred})}
            />
            </SafeAreaView>

        const issued = true
        const first =  issued ? listItem : avatar
        const second = issued ? avatar : listItem

        const fragment = (
            <React.Fragment>
                <View style={{flex: 1, flexDirection: 'row',}}>
                    {first}
                    {second}
                </View>
            </React.Fragment>
        )
        return fragment
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={creds}
                    extraData={refresh}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <Divider/>}
                    renderItem={({item}) => renderCredRow(item)}
                />
            </SafeAreaView>
        </View>
    )
};

export default DemoCredentialCredentialsScreen
