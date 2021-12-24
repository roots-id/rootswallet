import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, NativeModules } from 'react-native';

const { CalendarModule, PrismModule } = NativeModules;

export default function App() {
  const onPress = () => {
    console.log('DID: ' + PrismModule.createDID("passphrase"));
  };

  return (
    <View style={styles.container}>
      <Text>Roots Wallet</Text>
      <StatusBar style="auto" />
      <Button
        title="Click to generate DID"
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
