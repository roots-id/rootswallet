import React, {useState} from 'react';
import {Text, TouchableOpacity, View, DeviceEventEmitter} from 'react-native';


function SignInScreen({navigation, route}) {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>SignIn Screen</Text>
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('Help');
                }}
            >
                <Text>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => {
                    DeviceEventEmitter.emit('event.login', "My Wallet Name")
                }
                }
            >
                <Text>Log In</Text>
            </TouchableOpacity>

        </View>
    )
}

export default SignInScreen