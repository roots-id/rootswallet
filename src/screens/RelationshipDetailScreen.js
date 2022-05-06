import React, { useEffect, useState } from 'react';
import {
  Animated,
  Button,
  FlatList,
  Image,
  Text,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';

import {logger} from '../logging';
import { Divider, IconButton, List, Title,ToggleButton } from 'react-native-paper';
import styles from "../styles/styles";

import { getChatsByRel } from '../roots'

import IconActions from '../components/IconActions';

export default function RelationshipDetailScreen({ route, navigation }) {
    const [rel, setRel] = useState(route.params.rel);
    const { colors } = useTheme();
    const { current } = useCardAnimation();

    useEffect(() => {
        console.log("rel changed",rel)
    }, [rel]);
//<List.Icon {...props} icon="folder" />
//          keyExtractor={(item) => item}
//            ItemSeparatorComponent={() => <Divider />}
//            renderItem={({ item }) => (
//              <List.Item
//                title="{item}"
//                titleNumberOfLines={1}
//                left={props => <Text>lance</Text>}
//                onPress={() => goToRel(item)}
//              />
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Pressable
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        ]}
        onPress={navigation.goBack}
      />
      <Animated.View
        style={{
          padding: 16,
          width: '90%',
          maxWidth: 500,
          borderRadius: 3,
          backgroundColor: colors.card,
          alignItems: 'center',
                  justifyContent: 'flex-start',
          transform: [
            {
              scale: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
        <Image source={rel.displayPictureUrl}
            style={{
              width:130,
              height:150,
              resizeMode:'contain',
              margin:8,
              justifyContent:'flex-start',
            }}
        />
        <Text style={styles.subText}>{rel.displayName}</Text>
        <Divider/>
        <Text style={styles.subText}>{rel.did}</Text>
        <IconActions nav={navigation} add="Create Secure Chat" scan='Scan QR Code'/>
        <Title style={styles.headingText}>Chats:</Title>
        <FlatList
          data={getChatsByRel(rel.id)}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
              <List.Item
                  title={item.title}
                  titleNumberOfLines={1}
                  titleStyle={styles.listTitle}
                  descriptionStyle={styles.listDescription}
                  descriptionNumberOfLines={1}
                  left={props => <Text style={styles.prism}>{item.title}</Text>}
                  onPress={() => navigation.navigate('Chat', { chatId: item.id })}
              />
          )}
        />
      </Animated.View>
    </View>
  );
}