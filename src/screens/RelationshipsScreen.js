import RelRow from '../components/RelRow'
import React, {useEffect, useState} from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import {Divider} from 'react-native-paper';
import {checkMessages} from '../roots/peerConversation'
import { getChatItems } from '../roots';
import {
    getRelationships, addRefreshTrigger,
    PRISM_BOT, ROOTS_BOT, hasNewRels
} from '../relationships'
import {styles} from "../styles/styles";

const RelationshipsScreen = ({route, navigation}) => {
    console.log("rel screen - params", route.params)
    const [refresh, setRefresh] = useState(true)
    const [contacts, setContacts] = useState([])

    useEffect(() => {
        addRefreshTrigger(() => {
            console.log("contacts screen - toggling refresh")
            setContacts(
                getRelationships().filter(rel => rel.displayName !== PRISM_BOT && rel.displayName !== ROOTS_BOT)
            )
            setRefresh(!refresh)
            console.log("contacts screen - contacts size", contacts.length)
        })
        hasNewRels()
    }, [])


    //every 5 seconds, gets all chats, finds the mediator and does a checkMessages
    useEffect(() => {
        const interval = setInterval(async () => {
            const result =  getChatItems()
            for (let i =0; i < result.length; i++  ) {
                let res = result[i]
                if (res.mediator !== undefined) {
                    console.log("checking messages for mediator")
                    await checkMessages(res.id)
                }
            };
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={contacts}
                    extraData={refresh}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <Divider/>}
                    renderItem={({item}) => (
                        <React.Fragment>
                            <View style={{flex: 1, flexDirection: 'row',}}>
                                <RelRow rel={item} nav={navigation}/>
                            </View>
                        </React.Fragment>
                    )}
                />
            </SafeAreaView>
        </View>
    )
};

export default RelationshipsScreen
