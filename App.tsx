import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, NativeModules } from 'react-native';
import { useTranslation } from 'react-i18next'
import './localization'

const { CalendarModule, PrismModule } = NativeModules;

export default function App() {
  const { t, i18n } = useTranslation()
  
  const onPress = () => {
    console.log('DID: ' + PrismModule.createDID("passphrase"));
  };

  return (
    <View style={styles.container}>
      <Text>{t('Home.Title')}</Text>
      <StatusBar style="auto" />
      <Button
        title={t('Home.GenerateDIDButton')}
        color="#841584"
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
