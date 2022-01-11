import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button, NativeModules } from 'react-native';
import { useTranslation } from 'react-i18next';
import './localization';
import { React, useState } from 'react';
import { SecureStore } from 'expo-secure-store';


const { CalendarModule, PrismModule } = NativeModules;

export default function App() {
  const { t, i18n } = useTranslation()

  const [passphrase, setPassPhrase] = useState('Enter passphrase');

  const [did, setDID] = useState('Your Generated DID');

  return (
    <View style={styles.container}>
      <Text>{t('Home.Title')}</Text>
      {}
      <TextInput
        style={styles.textInput}
        clearTextOnFocus={true}
        multiline={false}
        onChangeText={text => setPassPhrase(text)}
        value={passphrase}
      />
      {}
      <Button
        title="Generate DID"
        onPress={() => {
          setDID(generateDID(passphrase));
        }}
      />
      {}
      <TextInput
        style={styles.textInput}
        clearTextOnFocus
        multiline={false}
        editable={false}
        value={did}
      />
      {}
       <Button
          title="Save Passphrase and DID"
          onPress={() => {
            savePassDID(passphrase, did);
           }}
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
  textInput: {
      height: 35,
      borderColor: 'gray',
      borderWidth: 0.5,
      padding: 4,
    },
});

function generateDID(passphrase) {
  let did = PrismModule.createDID(passphrase)
  let output = 'From passphrase: '+passphrase+'\ngenerated DID:\n'+did
  console.log(output);
  return did
}

async function savePassDID(key,did) {
  //await SecureStore.setItemAsync(key, did);
  console.log('Saved key: ' + key + ' and DID: ' + did);
}

async function retrieveDIDByKey(key) {
    let did = await SecureStore.getItemAsync(key);
    console.log("Here's your DID \n" + did + "\n generated from key " + key);
}