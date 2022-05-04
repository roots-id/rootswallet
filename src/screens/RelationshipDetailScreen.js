import React, { useEffect, useState } from 'react';
import {
  Animated,
  Button,
  FlatList,
  Image,
  Text,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';

import {logger} from '../logging';
import { Divider, List, Title,ToggleButton } from 'react-native-paper';
import styles from "../styles/styles";

import getMessagesByUser from "../roots";

export default function RelationshipDetailScreen({ route, navigation }) {
    const [user, setUser] = useState(route.params.user);
    const { colors } = useTheme();
    const { current } = useCardAnimation();

    useEffect(() => {
        console.log("user changed",user)
    }, [user]);

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
          maxWidth: 400,
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
        <Image source={user.displayPictureUrl}
            style={{
              width:130,
              height:150,
              resizeMode:'contain',
              margin:8,
              justifyContent:'flex-start',
            }}
        />
        <Text style={styles.subText}>{user.displayName}</Text>
        <Divider/>
        <Text style={styles.subText}>{user.did}</Text>
        <Title style={styles.headingText}>Recent Activity:</Title>
        <FlatList
          data={getMessagesByUser(user.id)}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
              <List.Item
                  title={item.title}
                  titleNumberOfLines={1}
                  titleStyle={styles.listTitle}
                  descriptionStyle={styles.listDescription}
                  descriptionNumberOfLines={1}
                  onPress={() => navigation.navigate('Chat', { chatId: item.id })}
              />
          )}
        />
        <Title style={styles.headingText}>Chats:</Title>
      </Animated.View>
    </View>
  );
}