import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function SimpleTitle(...props) {
//    <React.Fragment>
  return (
        <View style={{flexDirection:'row',}}>
            <Text style={{ color: '#eeeeee',fontSize: 22,fontWeight: 'normal',textAlignVertical: "center",textAlign: "center", }}>
                {props[0]["title"].substring(0,11)+"..."}
            </Text>
        </View>
  );
}
