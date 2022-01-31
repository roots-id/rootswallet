import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, SafeAreaView, ScrollView, Button, NativeModules } from 'react-native';
import { useTranslation } from 'react-i18next';
import './localization';
import { React, useState } from 'react';
import * as SecureStore from 'expo-secure-store';


const { CalendarModule, PrismModule } = NativeModules;

export default function App() {
  const { t, i18n } = useTranslation()

  const [passphrase, setPassPhrase] = useState();

  const [did, setDID] = useState('DID');

  const [didIndex, setDidIndex] = useState(0);

  const [outputArea, setOutputArea] = useState('output area');

  const [keys, setKeys] = useState(new Set<int>())

  return (
    <View style={styles.container}>
      <Text>{t('Home.Title')}</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text>{t('Home.EnterPassPhrase')}:  </Text>
        <TextInput
          style={styles.textInput}
          placeHolderText={passphrase}
          clearTextOnFocus={true}
          multiline={false}
          secureTextEntry={true}
          onChangeText={text => setPassPhrase(text)}
          value={passphrase}
        />
        <Button
          title={t('Home.GenerateDIDButton')}
            onPress={() => {
              setDID(generateDID(passphrase,didIndex+1));
              addKey(didIndex+1,keys);
              setDidIndex(didIndex+1);
          }}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
      <Text>{t('Home.GeneratedDID')}:  </Text>
      <TextInput
        style={[styles.textInput,{width: 250}]}
        maxLength={41}
        clearTextOnFocus
        multiline={false}
        editable={false}
        value={did}
      />
      <Button
        title={t('Home.SaveDID')}
        onPress={() => {
          secureStoreKeyValue(didIndex, did);
        }}
      />
      </View>
        <Button
          title={t('Home.Refresh')}
          onPress={() => {
            printDIDs(keys,setOutputArea);
          }}
        />
        <SafeAreaView style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.text}>
              {outputArea}
            </Text>
          </ScrollView>
        </SafeAreaView>
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
      width: 100,
      borderColor: 'gray',
      borderWidth: 0.5,
      padding: 4,
  },
  console: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
    scrollView: {
      backgroundColor: 'gold',
      marginHorizontal: 20,
    },
});

function addKey(key,keys) {
  console.log('adding key '+key);
  keys.add(key);
}

function removeKey(key,keys) {
  console.log('removing key '+key);
  keys.remove(key);
}

function generateDID(passphrase,didIndex) {
  let did = PrismModule.createDID(passphrase)
  let output = 'From passphrase: '+passphrase+'\ngenerated DID #'+didIndex+':\n'+did
  console.log(output);
  return did
}

function showDIDs(dids) {
  let output = 'Your DIDs are:\n'+dids
  console.log(output);
  return dids
}

async function secureStoreKeyValue(key,value) {
  try {
    await SecureStore.setItemAsync(key.toString(), value.toString());
    console.log('Saved key: ' + key + ' and value: ' + value);
  } catch(e) {
    console.log(e);
  }
}

async function getSecureStoreValue(key) {
    try {
        console.log("Retrieving key " + key);
        let value = await SecureStore.getItemAsync(key.toString());
        if (value) {
          console.log("Here's your value \n" + value);
        } else {
          console.log('No values stored under ' + key);
        }
        return value;
    } catch(e) {
        console.log(e);
    }
    return null;
}

async function printDIDs(didKeys,setMe) {
  let output:string = "Your DIDs";
  console.log("Getting DIDs from "+didKeys.size+" keys.");
  didKeys.forEach(async function(item){
      let dkey:int = item;
      console.log("key is "+ dkey);
      let value:string = await getSecureStoreValue(dkey);
      if (value) {
        console.log("Secure Store key " + dkey + "\n has value " + value);
        output = output.concat(dkey,"=",value,"\n\n");
      } else {
        console.log('No values stored under that key.');
      }
  });
  console.log('Setting output to ' + output);
  setMe(output);
}