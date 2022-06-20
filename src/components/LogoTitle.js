import React from 'react';
import { Image, Text, View } from 'react-native';
import {brandLogo} from "../relationships";

function getTitle(title) {
    if(title.length > 12) {
        return title.substring(0,11)+"..."
    } else {
        return title
    }
}

export default function LogoTitle(...props) {
//    <React.Fragment>
  return (
        <View style={{flexDirection:'row',}}>
            <Image
              style={{ width: 50, height: 50 }}
              source={brandLogo}
            />
            <Text style={{ color: '#eeeeee',fontSize: 22,fontWeight: 'normal',textAlignVertical: "center",textAlign: "center", }}>
                {getTitle(props[0]["title"])}
            </Text>
        </View>
  );
}
