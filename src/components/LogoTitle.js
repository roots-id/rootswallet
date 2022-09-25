import React from 'react';
import { Image, Text, View } from 'react-native';
import * as utils from "../utils";

export default function LogoTitle(...props) {
//    <React.Fragment>
    function getLogo() {
        if(props[0]["logo"]) {
            return <Image
                style={{width: 50, height: 50}}
                source={props[0]["logo"]}
            />
        }
    }

  return (
        <View style={{flexDirection:'row'}}>
            {getLogo()}
            <Text style={{ color: '#eeeeee',fontSize: 22,fontWeight: 'normal',textAlignVertical: "center",textAlign: "center", }}>
                {utils.getTitle(props[0]["title"],10)}
            </Text>
        </View>
  );
}
