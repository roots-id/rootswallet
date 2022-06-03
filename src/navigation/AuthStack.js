import React from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { Avatar, IconButton, Title } from 'react-native-paper';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {
    HOME_SCREEN,
    SETUP_SCREEN,
    RELATIONSHIPS_SCREEN,
} from "../constants/navigationConstants";
import CommunicationsScreen from '../screens/CommunicationsScreen';
import IconActions from '../components/IconActions';
import LogoTitle from '../components/LogoTitle';
import CreateRelScreen from '../screens/CreateRelScreen';
import CredentialsScreen from '../screens/CredentialsScreen';
import CredentialDetailScreen from "../screens/CredentialDetailScreen";
import HelpScreen from '../screens/HelpScreen';
import HomeScreen from "../screens/HomeScreen"
import MyIdentityScreen from '../screens/MyIdentityScreen';
import RelationshipsScreen from "../screens/RelationshipsScreen";
import RelationshipDetailScreen from "../screens/RelationshipDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SimpleTitle from '../components/SimpleTitle';
import WalletScreen from "../screens/WalletScreen";

import AuthContext from '../context/AuthenticationContext';

import ChatScreen from '../screens/ChatScreen';
import CreateWalletScreen from '../screens/CreateWalletScreen';
import ChatListScreen from '../screens/ChatListScreen';
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import ScanQRCodeScreen from '../screens/ScanQRCodeScreen'
import ShowQRCodeScreen from '../screens/ShowQRCodeScreen'
import StartChatScreen from '../screens/StartChatScreen';
import {YOU_ALIAS} from '../relationships'
import { getChatItem, loadSettings, storageStatus,
    TEST_WALLET_NAME } from '../roots'
import {getRootsWallet, hasWallet} from '../wallet'

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator()

export default function AuthStack() {
    console.log("AuthStack - Determining which auth screen to use.")
    const [walletFound,setWalletFound] = React.useState(false)
    const [walletName,setWalletName] = React.useState(TEST_WALLET_NAME)

    const [state, dispatch] = React.useReducer(
      (prevState, action) => {
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
          if(settingsLoaded) {
              //TODO ditch test wallet name
              const walFound = await hasWallet(walletName)
              console.log("AuthStack - wallet found?",walFound)
              setWalletFound(walFound)
              if(walFound) {
                //TODO ditch test wallet name
                console.log("AuthStack - since wallet found, getting rootsWallet")
                userToken = getRootsWallet(walletName)
              } else {
                console.log("AuthStack - since wallet NOT found, auth token not set")
              }
          }
        } catch (e) {
          // Restoring token failed
          console.log("AuthStack - Failed to restore wallet from storage",e)
        }

        dispatch({ type: 'RESTORE_TOKEN', token: userToken });
      };

      bootstrapAsync();
    }, []);

    const authContext = React.useMemo(
        () => ({
          signIn: (data,created=false) => {
            setWalletFound(created)
            dispatch({ type: 'SIGN_IN', token: data});
          }
        }),
        []
    );

    if (state.isLoading) {
        // We haven't finished checking for the token yet
        return <LoadingScreen />;
    }
//<Tab.Screen name="Integration" component={IntegrationStack}/>
    const Main = () => {
        return (
            <Tab.Navigator screenOptions={{
                 headerShown:false,
                 tabBarIcon: ({ focused, color, size }) => {
                     const iconName = focused ? 'check-bold' : 'checkbox-blank-circle-outline';
                     // You can return any component that you like here!
                     return <Avatar.Icon size={20} icon={iconName} />
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
              cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS,
              animationEnabled: true,
              }}
        >
            <Stack.Group>
                <Stack.Screen name="Relationships"
                      component={RelationshipsScreen}
                      initialParams={{walletName: walletName}}
                      options={ ({ navigation, route }) => ({
                          headerTitle: (props) => <LogoTitle {...props} title="Contacts"/>,
                          headerRight: (props) => <IconActions {...props} nav={navigation} add="Create Rel" person={YOU_ALIAS} scan='contact' settings='Settings'/>,
                      })}
                />
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={ ({ navigation, route }) => ({
                        headerTitle: (props) => <SimpleTitle {...props} title={getChatItem(route.params.chatId).title}/>,
                        headerRight: (props) => <IconActions {...props} nav={navigation} add="Create Rel" person={YOU_ALIAS} scan='credential' settings='Settings'/>,
                    })}
                />
            </Stack.Group>
        </Stack.Navigator>
        )
    }
    const YouStack = () => {
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
                  cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS,
                  animationEnabled: true,
                }}

            >
            <Stack.Group>
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    initialParams={{chatId: YOU_ALIAS}}
                    options={ ({ navigation, route }) => ({
                        headerTitle: (props) => <LogoTitle {...props} title={"You"}/>,
                        headerRight: (props) => <IconActions {...props} nav={navigation}
                            add="Create Rel" person={YOU_ALIAS} scan='contact' settings='Settings'/>,
                    })}
                />
            </Stack.Group>
            </Stack.Navigator>
        )
    }
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
              cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS,
              animationEnabled: true,
              }}
        >
            <Stack.Group>
                <Stack.Screen name="VCs"
                      component={CredentialsScreen}
                      initialParams={{walletName: walletName}}
                      options={ ({ navigation, route }) => ({
                          headerTitle: (props) => <LogoTitle {...props} title="Credentials"/>,
                          headerRight: (props) => <IconActions {...props} nav={navigation} person={YOU_ALIAS} scan="credential" settings="Settings"/>,
                      })}
                />
            </Stack.Group>
        </Stack.Navigator>
        )
    }
    const IntegrationStack = () => {
        return (
        <Stack.Navigator>
            <Stack.Group>
                <Stack.Screen name="Home" component={HomeScreen}/>
                <Stack.Screen name="MyIdentity"
                              component={RelationshipsScreen}
                              initialParams={{walletName: walletName}}
                />
                <Stack.Screen name="Communications" component={CommunicationsScreen}/>
                <Stack.Screen name="Help" component={HelpScreen}/>
                <Stack.Screen name="Settings" component={SettingsScreen}/>
                <Stack.Screen name="Wallet" component={WalletScreen}/>
            </Stack.Group>
        </Stack.Navigator>
        )
    }

    const WalletHistoryStack = () => {
        <Stack.Navigator>
            <Stack.Group>
                <Stack.Screen name="WalletHistory" component={WalletHistoryScreen}/>
            </Stack.Group>
        </Stack.Navigator>
    }

 //TODO refactor hasWallet call where we capture walletName
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
                        <Stack.Screen name="Login" component={LoginScreen} />
                    </>
                    ) : (
                    <>
                        <Stack.Screen name="Create Wallet" component={CreateWalletScreen} />
                    </>
                  )}
              </>
            ) : (
              <>
                <Stack.Group>
                    <Stack.Screen name="mainTabs" component={Main}/>
                </Stack.Group>
                <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                    <Stack.Screen name="Credential Details" component={CredentialDetailScreen}/>
                    <Stack.Screen name="Create Rel" component={CreateRelScreen}/>
                    <Stack.Screen name="Create Secure Chat" component={StartChatScreen} />
                    <Stack.Screen name="Help" component={HelpScreen}/>
                    <Stack.Screen name="Relationship Details" component={RelationshipDetailScreen}/>
                    <Stack.Screen name="Scan QR Code" component={ScanQRCodeScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen}/>
                    <Stack.Screen name="Show QR Code" component={ShowQRCodeScreen} />
                    <Stack.Screen name="Integration" component={IntegrationStack}/>
                </Stack.Group>
              </>
            )}
        </Stack.Navigator>
    </AuthContext.Provider>
  );

}