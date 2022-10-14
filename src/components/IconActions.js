import React from 'react';
import {View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {  createOOBInvitation } from '../roots/peerConversation';
import * as roots from '../roots';
import {asContactShareable, getContactByAlias, showRel} from '../relationships';

export default function IconActions(...props) {
//  console.log("IconActions - props",props)
    const navigation = props[0]["nav"]
    const add = props[0]["add"]
    const person = props[0]["person"]
    const scan = props[0]["scan"]
    const settings = props[0]["settings"]
    const workflows = props[0]["workflows"]
//          <IconButton
//                icon="plus"
//                size={28}
//                color="#e69138"
//                onPress={() => navigation.navigate(add)}
//            />
    return (
        <View style={{flexDirection: 'row',}}>
            <IconButton
                icon="account"
                size={28}
                color="#e69138"
                onPress={() => showRel(navigation, asContactShareable(getContactByAlias(person)))}
            />
            <IconButton
                icon="qrcode-scan"
                size={28}
                color="#e69138"
                onPress={() => navigation.navigate("Scan QR Code", {type: scan})}
            />
            <IconButton
                icon="cog-outline"
                size={28}
                color="#e69138"
                onPress={() => navigation.navigate(settings)}
            />
            <IconButton
                icon="chat-plus-outline"
                size={28}
                color="#e69138"
                // TODO: disabled if getMediatorURL is an empty string else enabled
                // disabled = {async () => {
                //     const data = await roots.getMediatorURL() 
                //     return data === ""}}

                // onPress={async () => navigation.navigate("Show QR Code",{qrdata: await createOOBInvitation('mediator')})}
                //convert single line async  onPress function to multi-line
                onPress={async () => {
                    const data = await createOOBInvitation('mediator')
                    console.log("IconActions - data",data)
                    navigation.navigate("Show QR Code",{qrdata: data})
                }
            }

            />
        </View>
    )
}
