import RelRow from '../components/RelRow'
import React, {useEffect, useState} from 'react';
import {FlatList, SafeAreaView, View} from 'react-native';
import {Divider} from 'react-native-paper';
import {
    getRelationships, addRefreshTrigger,
    PRISM_BOT, ROOTS_BOT, hasNewRels
} from '../relationships'
import {styles} from "../styles/styles";
import {checkMessages} from '../roots/peerConversation'
import { getChatItems } from '../roots';
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

    //evert 5 seconds, check for new messages fron all chats
    useEffect(() => {
        const interval = setInterval(async () => {
            console.log("checking for new messages")
            const result =  getChatItems()
            console.log('breakkkkkk')
            for (let i =0; i < result.length; i++  ) {
                //check if index >1 
                let res = result[i]
                console.log('res', res)
                if (res.id == 'Mediator') {
                    console.log('MEDIAOTR CHECKING MESSAGESSS')
                    console.log(res.id)
                    await checkMessages(res.id)
                }
            };
        }, 6000);
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
