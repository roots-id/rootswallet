import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
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

const navigator = createStackNavigator(
    {
        [HOME_SCREEN]: HomeScreen,
        [SETUP_SCREEN]: SettingsScreen,
        [RELATIONSHIPS_SCREEN]: RelationshipsScreen,
        [CREDENTIALS_SCREEN]: CredentialsScreen,
        [CREDENTIALDETAILS_SCREEN]: CredentialDetailsScreen,
    },
    {
        initialRouteName: SETUP_SCREEN,
        defaultNavigationOptions: {
            title: "RootsWallet",
        },
    }
);

export default createAppContainer(navigator);