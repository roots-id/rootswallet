import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from "./src/screens/HomeScreen"
import MyIdentityScreen from "./src/screens/MyIdentityScreen"
import CredentialsScreen from "./src/screens/CredentialsScreen";
import CommunicationsScreen from "./src/screens/CommunicationsScreen";
import HelpScreen from "./src/screens/HelpScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const navigator = createStackNavigator(
    {
        Home: HomeScreen,
        MyIdentity: MyIdentityScreen,
        CredentialsScreen: CredentialsScreen,
        CommunicationsScreen: CommunicationsScreen,
        HelpScreen: HelpScreen,
        SettingsScreen: SettingsScreen
    },
    {
        initialRouteName: "Home",
        defaultNavigationOptions: {
            title: "RootsWallet",
        },
    }
);

export default createAppContainer(navigator);