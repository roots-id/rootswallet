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
import { Divider, List, Title,ToggleButton } from 'react-native-paper';
import styles from "../styles/styles";

import { getMessagesByRel } from '../roots'

export default function RelationshipDetailScreen({ route, navigation }) {
    const [rel, setRel] = useState(route.params.rel);
    const { colors } = useTheme();
    const { current } = useCardAnimation();

    useEffect(() => {
        console.log("rel changed",rel)
    }, [rel]);

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
        <Title style={styles.headingText}>Recent Activity:</Title>
        <FlatList
          data={getMessagesByRel(rel.id)}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
<React.Fragment>
                            <SafeAreaView style={{width:200,justifyContent:'flex-start'}}>
                            <List.Item
                              title={item.displayName}
                              titleNumberOfLines={1}
                              titleStyle={styles.listTitle}
                              descriptionStyle={styles.listDescription}
                              descriptionNumberOfLines={1}
                              onPress={() => console.log("pressed")}
                            />
                            </SafeAreaView>
                    </React.Fragment>
          )}
        />
        <Title style={styles.headingText}>Chats:</Title>
      </Animated.View>
    </View>
  );
}