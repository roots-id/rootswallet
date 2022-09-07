import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function SimpleTitle(...props) {
//    <React.Fragment>
  return (
        <View style={{flexDirection:'row',}}>
            <Text maxLength="10" style={{ color: '#eeeeee',fontSize: 18,fontWeight: 'normal',
                alignContent: "flex-start" }}>
                {props[0]["title"]}
            </Text>
        </View>
  );
}
