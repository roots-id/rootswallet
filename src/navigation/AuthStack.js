import React from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { IconButton, Title } from 'react-native-paper';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {
    HOME_SCREEN,
    SETUP_SCREEN,
    RELATIONSHIPS_SCREEN,
} from "../constants/navigationConstants";
import CommunicationsScreen from '../screens/CommunicationsScreen';
import CredentialsScreen from '../screens/CredentialsScreen';
import RelationshipDetailScreen from "../screens/RelationshipDetailScreen";
import HelpScreen from '../screens/HelpScreen';
import HomeScreen from "../screens/HomeScreen"
import MyIdentityScreen from '../screens/MyIdentityScreen';
import RelationshipsScreen from "../screens/RelationshipsScreen";
import SettingsScreen from "../screens/SettingsScreen";

import AuthContext from '../context/AuthenticationContext';

import ChatScreen from '../screens/ChatScreen';
import CreateWalletScreen from '../screens/CreateWalletScreen';
import ChatListScreen from '../screens/ChatListScreen';
import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import ScanQRCodeScreen from '../screens/ScanQRCodeScreen'
import ShowQRCodeScreen from '../screens/ShowQRCodeScreen'
import StartChatScreen from '../screens/StartChatScreen';

import { getChatItem, getRootsWallet, storageStatus, hasWallet, TEST_WALLET_NAME } from '../roots'

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

    const Main = () => {
        return (
            <Tab.Navigator screenOptions={{headerShown:false}}>
                <Tab.Screen name="relationships" component={RelationshipsStack}/>
                <Tab.Screen name="chats" component={ChatsStack}/>
                <Tab.Screen name="integration" component={IntegrationStack}/>
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
                                  headerTitle: (props) => <LogoTitle {...props} title="Relationships:"/>,
                              })}
                />
            </Stack.Group>
        </Stack.Navigator>
        )
    }
    const ChatsStack = () => {
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
                    name="Chats"
                    component={ChatListScreen}
                    options={ ({ navigation, route }) => ({
                        headerTitle: (props) => <LogoTitle {...props} title="Secure Chats:"/>,
                        headerRight: () =>
                          <IconButton
                              icon="plus"
                              size={28}
                              color="#e69138"
                              onPress={() => navigation.navigate('Create Secure Chat')}
                          />,
                    })}
                />
                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={ ({ navigation, route }) => ({
                        headerTitle: (props) => <LogoTitle {...props} title={getChatItem(route.params.chatId).title}/>,
                        headerRight: () =>
                          <IconButton
                              icon="qrcode-scan"
                              size={28}
                              color="#e69138"
                              onPress={() => navigation.navigate('Scan QR Code')}
                          />,
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
                <Stack.Screen name="Credentials" component={CredentialsScreen}/>
                <Stack.Screen name="Communications" component={CommunicationsScreen}/>
                <Stack.Screen name="Help" component={HelpScreen}/>
                <Stack.Screen name="Settings" component={SettingsScreen}/>
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
                    <Stack.Screen name="relationshipStack" component={Main}/>
                </Stack.Group>
                <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                    <Stack.Screen name="Help" component={HelpScreen}/>
                    <Stack.Screen name="Create Secure Chat" component={StartChatScreen} />
                    <Stack.Screen name="Show QR Code" component={ShowQRCodeScreen} />
                    <Stack.Screen name="Scan QR Code" component={ScanQRCodeScreen} />
                    <Stack.Screen name="Relationship Details" component={RelationshipDetailScreen}/>
                </Stack.Group>
              </>
            )}
        </Stack.Navigator>
    </AuthContext.Provider>
  );

}
//TODO pull into it's own component
function LogoTitle(...props) {
  return (
    <React.Fragment>
        <View style={{flexDirection:'row',}}>
            <Image
              style={{ width: 50, height: 50 }}
              source={require('../assets/LogoOnly1024.png')}
            />
            <Text style={{ color: '#ff9138',fontSize: 22,fontWeight: 'normal',textAlignVertical: "center",textAlign: "center", }}>
                {props[0]["title"]}
            </Text>
        </View>
    </React.Fragment>
  );
}
