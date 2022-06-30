import React, {
    useContext,
    createContext,
    useEffect,
    useState}
    from 'react'
import {StyleSheet, Text, TouchableOpacity, View, Button, DeviceEventEmitter} from 'react-native';
import {NavigationContainer} from '@react-navigation/native'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {
    HOME_SCREEN,
    SETUP_SCREEN,
    RELATIONSHIPS_SCREEN,
    CREDENTIALS_SCREEN,
    CREDENTIALDETAILS_SCREEN,
} from "./src/constants/navigationConstants";
import HomeScreen from "./src/screens/HomeScreen"
import SettingsScreen from "./src/screens/SettingsScreen";
import RelationshipsScreen from "./src/screens/RelationshipsScreen";
import CredentialsScreen from "./src/screens/CredentialsScreen";
import CredentialDetailsScreen from "./src/screens/CredentialDetailsScreen";
import SignInScreen from './src/screens/SignInScreen'
import HelpScreen from './src/screens/HelpScreen'

// import storage from "./src/utils/Storage";

const WalletNameContext = createContext('')
const useWalletName = () => useContext(WalletNameContext)

const WalletNameContextProvider = ({children}) => {
    const [walletName, setWalletName] = useState('')
    const getWalletName = () => walletName
    const setMyWalletName = (wn) => setWalletName(wn)

    return (
        <WalletNameContext.Provider value={{
            walletName,
            getWalletName,
            setMyWalletName
        }}>
            {children}
        </WalletNameContext.Provider>
    )
}

function Chats1Screen() {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Chats1 Screen</Text>
        </View>
    )
}

function Chats2Screen() {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Chats2 Screen</Text>
        </View>
    )
}

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [xwalletName, setXWalletName] = useState('')

    const{walletName, getWalletName, setMyWalletName} = useWalletName()
   console.log(`read in WalletName: ${getWalletName}`)
    DeviceEventEmitter.addListener("event.login", (eventData) => {
        console.log(`walletName: ${eventData}`)
        setIsLoggedIn(true)
        setMyWalletName(eventData)


    })

    const Stack = createNativeStackNavigator()
    const Tab = createBottomTabNavigator()


    const Main = () => {
        return (
            <Tab.Navigator>
                <Tab.Screen name="relationships" component={RelationshipsStack}/>
                <Tab.Screen name="chats" component={ChatsStack}/>
            </Tab.Navigator>
        )
    }

    const RelationshipsStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Group>
                    <Stack.Screen name="Relationships"
                                  component={RelationshipsScreen}
                                  options={{walletName: walletName}}
                    />
                    <Stack.Screen name="Credentials" component={CredentialsScreen}/>
                    <Stack.Screen name="CredentialDetails" component={CredentialDetailsScreen}/>
                </Stack.Group>
            </Stack.Navigator>
        )
    }
    const ChatsStack = () => {
        return (
            <Stack.Group>
                <Stack.Screen name="Chats1" component={Chats1Screen}/>
                <Stack.Screen name="Chats2" component={Chats2Screen}/>
            </Stack.Group>
        )
    }


    return (
        <NavigationContainer>
            <Stack.Navigator>

                {isLoggedIn ? (
                    // Screens for logged in users
                    <Stack.Group>
                        <Stack.Screen name="relationshipStack" component={Main}/>
                        <Stack.Screen name="Home" component={HomeScreen}/>
                    </Stack.Group>
                ) : (
                    // Auth screens
                    <Stack.Group screenOptions={{headerShown: false}}>
                        <Stack.Screen name="SignIn"
                                      component={SignInScreen}
                        />
                        <Stack.Screen name="Main" component={Main}/>
                    </Stack.Group>
                )}
                {/* Common modal screens */}
                <Stack.Group screenOptions={{presentation: 'modal'}}>
                    <Stack.Screen name="Help" component={HelpScreen}/>
                </Stack.Group>
            </Stack.Navigator>

        </NavigationContainer>
    )

}