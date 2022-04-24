import React, {useState} from 'react';
// import {withNavigation} from "react-navigation";
import {TouchableOpacity, TextInput, View, Text} from 'react-native';
import {HOME_SCREEN, RELATIONSHIPS_SCREEN} from "../constants/navigationConstants";
import styles from '../styles/styles'
import {SimpleLineIcons} from '@expo/vector-icons'
// const { PrismModule } = NativeModules;

const Settings = ({navigation}) => {
    console.log(`> Settings screen`);
    const [tmpName, setTmpName] = useState('')
    const [walletName, setWalletName] = useState('')
    const [tmpPwd, setTmpPwd] = useState('')
    const [walletPwd, setWalletPwd] = useState('')

    const endEditing = () =>{
        console.log('> endEditing()')
        setWalletName(tmpName)
        setWalletPwd(tmpPwd)
        navigation.navigate(
            RELATIONSHIPS_SCREEN,
            {walletName: tmpName}
            )
    }

    return (
        <View>

            <Text style={styles.header}>Enter Wallet Name: {tmpName}</Text>
            <View style={styles.walletInputStyle}>
                <SimpleLineIcons
                    name="wallet"
                    style={styles.walletIconStyle}
                />
                <TextInput
                    style={styles.inputStyle}
                    onChangeText={(val) => setTmpName(val)}
                    onEndEditing={endEditing}
                    placeholder='Wallet Name'
                />
            </View>



            <Text style={styles.header}>Enter Password</Text>
            <View style={styles.walletInputStyle}>
                <TextInput
                    style={styles.inputStyle}
                    onChangeText={(val) => setTmpPwd(val)}
                    onEndEditing={endEditing}
                    placeholder='Wallet Password'
                />
            </View>
            <View style={styles.button}>
                <TouchableOpacity
                    color='gold'
                    style={styles.button}
                    onPress={()=>{
                        console.log('in onPress handler...')
                        setWalletName(tmpName)
                        setWalletPwd(tmpPwd)
                        navigation.navigate(
                            RELATIONSHIPS_SCREEN,
                            {walletName: tmpName})
                    }
                    }
                >
                    <Text style={styles.buttonText}>Create Wallet</Text>
                </TouchableOpacity>
            </View>



            <Text>Final Name: {walletName}</Text>
        </View>



    );
};

// export default withNavigation(Settings)
export default Settings
