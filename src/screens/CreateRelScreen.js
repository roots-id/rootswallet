import React, { useState } from 'react';
import { NativeModules, StyleSheet, Text, View } from 'react-native';
import { IconButton, Title } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';

import { YOU_ALIAS } from '../relationships';
import { initRoot } from '../roots';
import FormButton from '../components/FormButton';
import FormInput from '../components/FormInput';

const { PrismModule } = NativeModules;

export default function CreateRelScreen({ route, navigation }) {
  const [relDid, setRelDid] = useState(route.params.did);
  const [relName, setRelName] = useState('');
  const [problemDisabled, setProblemDisabled] = useState(true)

  async function handleButtonPress() {
    if (relName.length > 0) {
      const rel = await initRoot(relName,YOU_ALIAS,relDid)
      if(rel) {
          console.log("Created rel",rel)
          setProblemDisabled(true)
          navigation.navigate('Relationships')
      } else {
          console.log("Could not create relationship")
          setProblemDisabled(false)
      }
    }
  }

  return (
      <View style={styles.rootContainer}>
        <View style={styles.closeButtonContainer}>
          <IconButton
              icon="close-circle"
              size={36}
              color="#5b3a70"
              onPress={() => navigation.goBack()}
          />
        </View>
        <View style={styles.innerContainer}>
          <Title style={styles.title}>Create a new relationship</Title>
          <FormInput
              labelName="Enter Relationship Name"
              value={relName}
              onChangeText={(text) => setRelName(text)}
              clearButtonMode="while-editing"
          />
          <Text disable={problemDisabled} style={displayProblem(problemDisabled)}>Could not create relationship</Text>
          <FormButton
              title="Create Relationship"
              modeValue="contained"
              labelStyle={styles.buttonLabel}
              onPress={async () => handleButtonPress()}
              disabled={relName.length <= 0}
          />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#222222',
  },
    buttonLabel: {
      fontSize: 22,
    },
  closeButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    zIndex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    none: {
        display: 'none'
    },
    problem: {
        color: 'red',
    },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#dddddd',
  },
});

  function displayProblem(problemDisabled) {
    if(problemDisabled){
        return styles.none
    }
    else{
        return styles.problem
    }
  }