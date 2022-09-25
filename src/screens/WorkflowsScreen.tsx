import React, {useEffect, useState} from 'react';
import {
    Animated,
    Text,
    Pressable,
    View, Button, FlatList,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useCardAnimation} from '@react-navigation/stack';
import {IconButton, RadioButton, ToggleButton} from 'react-native-paper';
import {styles} from "../styles/styles";

import * as roots from '../roots'
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import FormButton from "../components/FormButton";
import {getWalletName} from "../wallet";
import {asContactShareable, getContactByAlias, showRel} from "../relationships";

export default function WorkflowsScreen({route, navigation}: CompositeScreenProps<any, any>) {
    const [selection, setSelection] = useState<Object>({name:"Membership Workflow"})
    const {current} = useCardAnimation();

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Pressable
                style={styles.pressable}
                onPress={navigation.goBack}
            />
            <View style={styles.closeButtonContainer}>
                <IconButton
                    icon="close-circle"
                    size={36}
                    color="#e69138"
                    onPress={() => navigation.goBack()}
                />
            </View>
            <Animated.View
                style={styles.viewAnimatedStart}
            >
                <Text style={[styles.titleText,styles.black]}>Workflows:</Text>
                <Text />
                <View style={[{flexDirection: 'row'},styles.closeButtonContainer]}>
                    <IconButton
                        icon="pencil"
                        size={28}
                        color="#e69138"
                        onPress={() => alert("can't edit workflows yet")}
                    />
                    <IconButton
                        icon="qrcode-scan"
                        size={28}
                        color="#e69138"
                        onPress={() => navigation.navigate('Show QR Code', {qrdata: {}})}
                    />
                </View>
                <View style={[styles.containerRowSpaced,{ marginBottom: 10,minHeight: 200,minWidth: "80%"}]}>
                <FlatList
                    persistentScrollbar={true}
                    keyExtractor={(item) => item.name}
                    inverted={false}
                    style={styles.scrollableCompact}
                    data={
                        [{name:"Membership Workflow"}]
                    }
                    ListEmptyComponent={<Text style={[styles.itemHighlighted, {alignContent: "flex-start"}]}>No Workflows</Text>}
                    renderItem={({item}) => (
                        <View style={styles.containerRow}>
                            <RadioButton
                                value={item.name}
                                color="#aa4004"
                                uncheckedColor="#aa4004"
                                onPress={() => alert("Not Implemented Yet")}
                                status={ (selection && item.name.match(selection.name)) ? 'checked' : 'unchecked' }
                            />
                            <Text style={(selection && item.name.match(selection.name)) ? [styles.itemHighlighted,styles.black,{justifyContent:"center"}] : [styles.clickableListArchive,styles.black]}>{item.name}</Text>
                        </View>
                    )}
                />
                </View>

            </Animated.View>
        </View>
    );
}
