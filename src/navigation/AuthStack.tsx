import 'react-native-gesture-handler';
import {Avatar} from 'react-native-paper';
import {CardStyleInterpolators, createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import CommunicationsScreen from '../screens/CommunicationsScreen';
import IconActions from '../components/IconActions';
import LogoTitle from '../components/LogoTitle';
import CreateRelScreen from '../screens/CreateRelScreen';
import CredentialsScreen from '../screens/CredentialsScreen';
import CredentialDetailScreen from "../screens/CredentialDetailScreen";
import DeveloperScreen from "../screens/DeveloperScreen";
import RelationshipsScreen from "../screens/RelationshipsScreen";
import RelationshipDetailScreen from "../screens/RelationshipDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SimpleTitle from '../components/SimpleTitle';
import WalletScreen from "../screens/WalletScreen";

import AuthContext from '../context/AuthenticationContext';

import ChatScreen from '../screens/ChatScreen';
import CreateWalletScreen from '../screens/CreateWalletScreen';
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import ScanQRCodeScreen from '../screens/ScanQRCodeScreen'
import ShowQRCodeScreen from '../screens/ShowQRCodeScreen'
import StartChatScreen from '../screens/StartChatScreen';
import React, {useState} from "react";
import {getChatItem, loadSettings, storageStatus} from '../roots'
import * as contact from '../relationships'
import * as utils from '../utils'
import * as wallet from '../wallet'
import {loadWalletName} from "../wallet";
import ExportScreen from '../screens/ExportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AuthStack() {
    console.log("AuthStack - Determining which auth screen to use.")
    const [walletFound, setWalletFound] = useState<boolean>(false);

    const [state, updateState] = React.useReducer(
        (prevState: any, action: any) => {
            switch (action.type) {
                case 'RESTORE_TOKEN':
                    console.log("AuthStack - RESTORE_TOKEN w/ token", action.token)
                    return {
                        ...prevState,
                        userToken: action.token,
                        isLoading: false,
                    };
                case 'SIGN_IN':
                    console.log("AuthStack - SIGN_IN w/ token", action.token)
                    return {
                        ...prevState,
                        userToken: action.token,
                    };
            }
        },
        {
            isLoading: true,
            userToken: null,
        }
    );

    React.useEffect(() => {
        // Fetch the token from storage then navigate to our appropriate place
        const bootstrapAsync = async () => {
            let userToken;

            try {
                console.log("AuthStack - getting RootsWallet")
                await storageStatus()
                const settingsLoaded = await loadSettings()
                if (settingsLoaded) {
                    const walNameLoaded = await loadWalletName()
                    setWalletFound(walNameLoaded)
                    console.log("AuthStack - wallet found?", walletFound)
                }
            } catch (e) {
                // Restoring token failed
                console.log("AuthStack - Failed to restore wallet from storage", e)
            }
            console.log("AuthStack - dispatching with userToken", userToken)
            updateState({type: 'RESTORE_TOKEN', token: userToken});
        };

        bootstrapAsync().then(r => {
            console.log("AuthStack - Bootstrap complete", r)
        });
    }, []);

    let authContext = React.useMemo(
        () => ({
            signIn: (data: string, created = false) => {
                console.log("AuthStack - signIn memo", data, created)
                updateState({type: 'SIGN_IN', token: data});
                setWalletFound(created)
            }
        }),
        []
    );

    if (state.isLoading) {
        // We haven't finished checking for the token yet
        return <LoadingScreen/>;
    }

    const Main = () => {
        return (
            <Tab.Navigator screenOptions={{
                headerShown: false,
                tabBarIcon: ({focused, color, size}) => {
                    const iconName = focused ? 'check-bold' : 'checkbox-blank-circle-outline';
                    // You can return any component that you like here!
                    return <Avatar.Icon size={20} icon={iconName}/>
                },
                tabBarActiveBackgroundColor: '#362631',
                tabBarInactiveBackgroundColor: '#150510',
                tabBarActiveTintColor: 'orange',
                tabBarInactiveTintColor: 'grey',
                tabBarLabelStyle: {fontSize: 22},
            }}>
                <Tab.Screen name="Contacts" component={RelationshipsStack}/>
                <Tab.Screen name="Credentials" component={CredentialsStack}/>
            </Tab.Navigator>
        )
    }
    const RelationshipsStack = () => {
        return (
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#150510',
                    },
                    headerTintColor: '#eeeeee',
                    headerTitleStyle: {
                        fontSize: 22,
                    },
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    animationEnabled: true,
                }}
            >
                <Stack.Group>
                    <Stack.Screen name="Relationships"
                                  component={RelationshipsScreen}
                                  options={({navigation, route}) => ({
                                      headerTitle: (props) => <LogoTitle {...props} title="Contacts"/>,
                                      headerRight: (props) => <IconActions {...props} nav={navigation} add="Create Rel"
                                                                           person={contact.getUserId()} scan='contact'
                                                                           settings='Settings'/>,
                                  })}
                    />
                    <Stack.Screen
                        name="Chat"
                        component={ChatScreen}
                        options={({navigation, route}) => ({
                            headerTitle: (props) => <SimpleTitle {...props}
                                                                 title={getChatItem(utils.getObjectField(route.params, "chatId")).title}/>,
                            headerRight: (props) => <IconActions {...props} nav={navigation} add="Create Rel"
                                                                 person={contact.getUserId()} scan='credential'
                                                                 settings='Settings'/>,
                        })}
                    />
                </Stack.Group>
            </Stack.Navigator>
        )
    }
    // const YouStack = () => {
    //     return (
    //         <Stack.Navigator
    //             screenOptions={{
    //               headerStyle: {
    //                 backgroundColor: '#150510',
    //               },
    //               headerTintColor: '#eeeeee',
    //               headerTitleStyle: {
    //                 fontSize: 22,
    //               },
    //               gestureEnabled: true,
    //               gestureDirection: "horizontal",
    //               cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS,
    //               animationEnabled: true,
    //             }}
    //
    //         >
    //         <Stack.Group>
    //             <Stack.Screen
    //                 name="Chat"
    //                 component={ChatScreen}
    //                 initialParams={{chatId: YOU_ALIAS}}
    //                 options={ ({ navigation, route }) => ({
    //                     headerTitle: (props) => <LogoTitle {...props} title={"You"}/>,
    //                     headerRight: (props) => <IconActions {...props} nav={navigation}
    //                         add="Create Rel" person={YOU_ALIAS} scan='contact' settings='Settings'/>,
    //                 })}
    //             />
    //         </Stack.Group>
    //         </Stack.Navigator>
    //     )
    // }
    const CredentialsStack = () => {
        return (
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#150510',
                    },
                    headerTintColor: '#eeeeee',
                    headerTitleStyle: {
                        fontSize: 22,
                    },
                    gestureEnabled: true,
                    gestureDirection: "horizontal",
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    animationEnabled: true,
                }}
            >
                <Stack.Group>
                    <Stack.Screen name="VCs"
                                  component={CredentialsScreen}
                                  options={({navigation, route}) => ({
                                      headerTitle: (props) => <LogoTitle {...props} title="Credentials"/>,
                                      headerRight: (props) => <IconActions {...props} nav={navigation}
                                                                           person={contact.getUserId()}
                                                                           scan="credential" settings="Settings"/>,
                                  })}
                    />
                </Stack.Group>
            </Stack.Navigator>
        )
    }
    const DevStack = () => {
        return (
            <Stack.Navigator>
                <Stack.Group>
                    <Stack.Screen name="Developer" component={DeveloperScreen}/>
                    <Stack.Screen name="Communications" component={CommunicationsScreen}/>
                    <Stack.Screen name="Export" component={ExportScreen}/>
                    <Stack.Screen name="Settings" component={SettingsScreen}/>
                    <Stack.Screen name="Wallet" component={WalletScreen}/>
                </Stack.Group>
            </Stack.Navigator>
        )
    }

    // const WalletHistoryStack = () => {
    //     <Stack.Navigator>
    //         <Stack.Group>
    //             <Stack.Screen name="WalletHistory" component={WalletHistoryScreen}/>
    //         </Stack.Group>
    //     </Stack.Navigator>
    // }

    return (
        <AuthContext.Provider value={authContext}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}

            >
                {!state.userToken || state.userToken == null ? (
                    <>
                        {walletFound ? (
                            <>
                                <Stack.Screen name="Login" component={LoginScreen}/>
                            </>
                        ) : (
                            <>
                                <Stack.Screen name="Create Wallet" component={CreateWalletScreen}/>
                                <Stack.Group screenOptions={{presentation: 'transparentModal'}}>
                                    <Stack.Screen name="Settings" component={SettingsScreen}/>
                                    <Stack.Screen name="Developer" component={DevStack}/>
                                </Stack.Group>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <Stack.Group>
                            <Stack.Screen name="mainTabs" component={Main}/>
                        </Stack.Group>
                        <Stack.Group screenOptions={{presentation: 'transparentModal'}}>
                            <Stack.Screen name="Credential Details" component={CredentialDetailScreen}/>
                            <Stack.Screen name="Create Rel" component={CreateRelScreen}/>
                            <Stack.Screen name="Create Secure Chat" component={StartChatScreen}/>
                            <Stack.Screen name="Relationship Details" component={RelationshipDetailScreen}/>
                            <Stack.Screen name="Scan QR Code" component={ScanQRCodeScreen}/>
                            <Stack.Screen name="Settings" component={SettingsScreen}/>
                            <Stack.Screen name="Show QR Code" component={ShowQRCodeScreen}/>
                            <Stack.Screen name="Developer" component={DevStack}/>
                        </Stack.Group>
                    </>
                )}
            </Stack.Navigator>
        </AuthContext.Provider>
    );

}
