import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, Button, NativeModules } from 'react-native';
import { useTranslation } from 'react-i18next';
import './localization';
import { React, useState } from 'react';
import * as SecureStore from 'expo-secure-store';


const { CalendarModule, PrismModule } = NativeModules;

export default function App() {
  const { t, i18n } = useTranslation()

  const [passphrase, setPassPhrase] = useState('Enter passphrase');

  const [did, setDID] = useState('Your Generated DID');

  const [securedids, setSecureDIDs] = useState('DIDs from passphrase');

  return (
    <View style={styles.container}>
      <Text>{t('Home.Title')}</Text>
      {}
      <View style={{ flexDirection: 'row' }}><TextInput
        style={styles.textInput}
        clearTextOnFocus={true}
        multiline={false}
        onChangeText={text => setPassPhrase(text)}
        value={passphrase}
      />
      <Button
        title="Generate DID"
        onPress={() => {
          setDID(generateDID(passphrase));
        }}
      />
      </View>
      <View style={{ flexDirection: 'row' }}>
      <TextInput
        style={styles.textInput}
        maxLength={41}
        clearTextOnFocus
        multiline={false}
        editable={false}
        value={did}
      />
       <Button
          title="Save Passphrase and DID"
          onPress={() => {
            savePassDID(passphrase, did);
           }}
        />
        </View>
       <View style={{ flexDirection: 'row' }}>
        <Button
          title="Retrieve DID"
          onPress={() => {
            retrieveDIDsByPassphrase(passphrase,setSecureDIDs);
           }}
       />
         <TextInput
           style={styles.textInput}
           maxLength={60}
           multiline={false}
           editable={false}
           value={securedids}
         />
       </View>
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

function showDIDs(dids) {
  let output = 'Your DIDs are:\n'+dids
  console.log(output);
  return dids
}

async function savePassDID(key,did) {
  try {
    await SecureStore.setItemAsync(key, did);
    console.log('Saved key: ' + key + ' and DID: ' + did);
  } catch(e) {
    console.log(e);
  }
}

async function retrieveDIDsByPassphrase(key,setSecureDIDs) {
    let dids = "No DIDs found"
    try {
        dids = await SecureStore.getItemAsync(key);
        console.log("Here's your DIDs \n" + dids + "\n generated from key " + key);
        setSecureDIDs(dids);
    } catch(e) {
        console.log(e);
    }
    return dids;
}