import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import * as utils from '../utils';

export default function SimpleTitle(...props) {
//    <React.Fragment>
  return (
        <View style={{flexDirection:'row',}}>
            <Text maxLength="10" style={{ color: '#eeeeee',fontSize: 22,fontWeight: 'normal',textAlignVertical: "center",textAlign: "center", }}>
                {utils.getTitle(props[0]["title"],12)}
            </Text>
        </View>
  );
}
