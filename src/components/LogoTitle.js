import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function LogoTitle(...props) {
//    <React.Fragment>
  return (
        <View style={{flexDirection:'row',}}>
            <Image
              style={{ width: 50, height: 50 }}
              source={require('../assets/LogoOnly1024.png')}
            />
            <Text style={{ color: '#eeeeee',fontSize: 22,fontWeight: 'normal',textAlignVertical: "center",textAlign: "center", }}>
                {props[0]["title"]}
            </Text>
        </View>
  );
}
