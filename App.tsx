import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView, ScrollView, Button, NativeModules } from 'react-native';
import { useTranslation } from 'react-i18next';
import './localization';
import { React, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const { CalendarModule, PrismModule } = NativeModules;

// async function openDatabase(pathToDatabaseFile: string): Promise<SQLite.WebSQLDatabase> {
//   if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
//     await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
//   }
//   await FileSystem.downloadAsync(
//     Asset.fromModule(pathToDatabaseFile).uri,
//     FileSystem.documentDirectory + 'SQLite/RootsWalletDB.db'
//   );
//   console.log('Database in ' + FileSystem.documentDirectory + 'SQLite/RootsWalletDB.db');
//   return SQLite.openDatabase('RootsWalletDB.db');
// }
function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }
  const dbName = "test.db";
  const db = SQLite.openDatabase(dbName);
  console.log('Database at ' + FileSystem.documentDirectory + "SQLite/"+dbName)
  return db;
}

const db = openDatabase();

function Items({ done: doneHeading, onPressItem }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from items where done = ?;`,
        [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array)
      );
    });
  }, []);

  const heading = doneHeading ? "Completed" : "Todo";

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, done, value }) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: done ? "#1c9963" : "#fff",
            borderColor: "#000",
            borderWidth: 1,
            padding: 8,
          }}
        >
          <Text style={{ color: done ? "#fff" : "#000" }}>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}


export default function App() {
  const { t, i18n } = useTranslation()
  const [passphrase, setPassPhrase] = useState();
  const [did, setDID] = useState('DID');
  const [didIndex, setDidIndex] = useState(0);
  const [outputArea, setOutputArea] = useState('output area');
  const [keys, setKeys] = useState(new Set<int>())
  const [dbText, setDBText] = useState(null);
  const [asyncKey, setAsyncKey] = useState();
  const [asyncValue, setAsyncValue] = useState();
  const [asyncRetrievalKey, setAsyncRetrievalKey] = useState();
  const [asyncRetrievalValue, setAsyncRetrievalValue] = useState();
  const [forceUpdate, forceUpdateId] = useForceUpdate();

 useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "create table if not exists items (id integer primary key not null, done int, value text);"
      );
    });
  }, []);

  const add = (text) => {
    // is text empty?
    if (text === null || text === "") {
      return false;
    }

    db.transaction(
      (tx) => {
        tx.executeSql("insert into items (done, value) values (0, ?)", [text]);
        tx.executeSql("select * from items", [], (_, { rows }) =>
          console.log(JSON.stringify(rows))
        );
      },
      null,
      forceUpdate
    );
  };

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

        <Text style={styles.heading}>SQLite DB</Text>

        {Platform.OS === "web" ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={styles.heading}>
              Expo SQlite is not supported on web!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.flexRow}>
              <TextInput
                onChangeText={(text) => setDBText(text)}
                onSubmitEditing={() => {
                  add(dbText);
                  setDBText(null);
                }}
                placeholder="Your DB text"
                style={styles.input}
                value={dbText}
              />
            </View>
            <ScrollView style={styles.listArea}>
              <Items
                key={`forceupdate-todo-${forceUpdateId}`}
                done={false}
                onPressItem={(id) =>
                  db.transaction(
                    (tx) => {
                      tx.executeSql(`update items set done = 1 where id = ?;`, [
                        id,
                      ]);
                    },
                    null,
                    forceUpdate
                  )
                }
              />
              <Items
                done
                key={`forceupdate-done-${forceUpdateId}`}
                onPressItem={(id) =>
                  db.transaction(
                    (tx) => {
                      tx.executeSql(`delete from items where id = ?;`, [id]);
                    },
                    null,
                    forceUpdate
                  )
                }
              />
            </ScrollView>
          </>
        )}

      <View style={{ flexDirection: 'row' }}>
        <Text>Async Storage:  </Text>
        <TextInput
          style={styles.textInput}
          placeHolderText={"Async Key"}
          clearTextOnFocus={true}
          multiline={false}
          secureTextEntry={false}
          onChangeText={text => setAsyncKey(text)}
          value={asyncKey}
        />
        <TextInput
          style={styles.textInput}
          placeHolderText={"Async Value"}
          clearTextOnFocus={true}
          multiline={false}
          secureTextEntry={false}
          onChangeText={text => setAsyncValue(text)}
          value={asyncValue}
        />
        <Button
          title={"Save Async"}
            onPress={() => {
              storeUnencryptedAsyncData(asyncKey,asyncValue)
          }}
        />
       <Button
          title={"Retrieve Async"}
            onPress={() => {
              getUnencryptedAsyncData(asyncKey,setAsyncValue)
          }}
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


function useForceUpdate() {
    const [value, setValue] = useState(0);
    return [() => setValue(value + 1), value];
}

const storeUnencryptedAsyncData = async (asyncKey,asyncValue) => {
  console.log('storing unencrypted async for: ' + asyncKey + ": " + asyncValue);
  try {
    await AsyncStorage.setItem(asyncKey, asyncValue)
  } catch (e) {
    console.log(e);
  }
}
//Storing object value
// const storeUnencryptedAsyncJsonData = async (value) => {
//   console.log('getting unencrypted async for @asyncKey: ' + value);
//   try {
//     const jsonValue = JSON.stringify(value)
//     await AsyncStorage.setItem('@asyncKey', jsonValue)
//   } catch (e) {
//     console.log(e);
//   }
// }

const getUnencryptedAsyncData = async (key,setMe) => {
  console.log('getting unencrypted async for '+key)
  try {
    let val = await AsyncStorage.getItem(key)
    console.log('got value ' + val);
    setMe(val);
  } catch(e) {
    console.log(e);
  }
}

// const getUnencryptedAsyncJsonData = async (asyncRetrievalKey) => {
//   console.log('getting unencrypted async json for '+asyncRetrievalKey)
//   try {
//     const jsonValue = await AsyncStorage.getItem(asyncRetrievalKey)
//     return jsonValue != null ? JSON.parse(jsonValue) : null;
//   } catch(e) {
//     console.log(e);
//   }
// }