import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

export default function IconActions(...props) {
//  console.log("IconActions - props",props)
  const navigation = props[0]["nav"]
  const add = props[0]["add"]
  const scan = props[0]["scan"]
  const settings = props[0]["settings"]
  return (
    <View style={{flexDirection:'row',}}>
        <IconButton
              icon="plus"
              size={28}
              color="#e69138"
              onPress={() => navigation.navigate(add)}
          />
        <IconButton
            icon="qrcode-scan"
            size={28}
            color="#e69138"
            onPress={() => navigation.navigate(scan)}
        />
        <IconButton
              icon="cog-outline"
              size={28}
              color="#e69138"
              onPress={() => navigation.navigate(settings)}
          />
    </View>
  )
}