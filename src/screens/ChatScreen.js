import React, { useContext, useEffect, useState } from 'react';
import { KeyboardAvoidingView, NativeModules, StyleSheet, Text, View } from 'react-native';
import { Actions, ActionsProps, Bubble, ChatInput,
    Composer, GiftedChat, InputToolbar, Message, SendButton } from 'react-native-gifted-chat';

//import { Video, VideoPlayer } from 'react-native-video'
//import { useInterval } from 'usehooks-ts'
//import { BarCodeScanner } from 'expo-barcode-scanner';
//import emojiUtils from 'emoji-utils';

import { BLOCKCHAIN_URI_MSG_TYPE, createDemoCredential, getMessages,
    getChatItem, getFakePromise,
    getFakePromiseAsync, getQuickReplyResultMessage, getUserItem, isDemo, isProcessing,
    processQuickReply,
    sendMessage, sendMessages, startChatSession,
    TEXT_MSG_TYPE } from '../roots';
import Loading from '../components/Loading';

const { PrismModule } = NativeModules;

export default function ChatScreen({ route, navigation }) {
    console.log("ChatScreen - route params",route.params)
//  const [ user, setUser ] = useState(user);
    const [chat, setChat] = useState(getChatItem(route.params.chatId));
    console.log("ChatScreen - got chatItem ",chat)
//    const [hasPermission, setHasPermission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [madeCredential, setMadeCredential] = useState(false)
    const [messages, setMessages] = useState([]);
    const [processing, setProcessing] = useState(false)
//    const [scanned, setScanned] = useState(false);
    const [showSystem, setShowSystem] = useState(false)

    useEffect(() => {
        let isCancelled = false;
        console.log("ChatScreen - useEffect",chat)
        const chatSession = startChatSession({
            chat: chat,
            onReceivedMessage: (message) => {
                if (!isCancelled) {
                    setMessages((currentMessages) =>
                        GiftedChat.append(currentMessages, [mapMessage(message)])
                    );
                }
            },
            onReceivedKeystrokes: (keystrokes) => {
             // handle received typing keystrokes
            },
            onTypingStarted: (user) => {
                //handle typing
            },
            onTypingStopped: (user) => {
             // handle user stops typing
            },
            onParticipantEnteredChat: (user) => {
             // handle user who just entered the chat
            },
            onParticipantLeftChat: (user) => {
             // handle user who just left the chat
            },
            onParticipantPresenceChanged: (user) => {
             // handle user who became online, offline, do not disturb, invisible
            },
            onMessageRead: (message, receipt) => {
             // handle read receipt for message
            },
            onMessageUpdated: (message) => {
             // handle message changes
            },
            onChatUpdated: (chat) => {
             // handle chat changes
            },
            onProcessing: (processing) => {
                if (!isCancelled) {
                    setProcessing(processing)
                }
            },
        });
        if (chatSession.succeeded) {
            console.log("chat session started")
            const session = chatSession.session; // Handle session
        }
        if (chatSession.failed) {
            console.log("chat session failed")
            const error = chatSession.error; // Handle error
        }
//        console.log("Getting all messages")
//        getAllMessages(chat.id)
//            .then((result) => {
//                setMessages(result.paginator.items.map(mapMessage));
//                setLoading(false);
//            });
        return () =>
            {chatSession.end
            isCanceled = true;}
    }, [chat]);

    useEffect(() => {
        //console.log("ChatScreen - Front-end messages updated")
    }, [messages]);

    useEffect(() => {
        console.log("ChatScreen - Checked Processing")
    }, [processing]);

    useEffect(() => {
        console.log("ChatScreen - getting all messages")
        const msgs = getMessages(chat.id)
        console.log("ChatScreen - got",msgs.length,"msgs")
        msgs.forEach(msg => console.log("ChatScreen - got msg w/keys",Object.keys(msg)))
        //const msgs = {paginator: {items: }}
        setMessages(msgs.map(msg => mapMessage(msg)));
        setLoading(false);
    }, [showSystem]);

//    useEffect(() => {
//        (async () => {
//          const { status } = await BarCodeScanner.requestPermissionsAsync();
//          setHasPermission(status === 'granted');
//        })();
//    }, []);
//      const handleBarCodeScanned = ({ type, data }) => {
//        setScanned(true);
//        alert(`Bar code with type ${type} and data ${data} has been scanned!`);
//      };
//
//      if (hasPermission === null) {
//        return <Text>Requesting for camera permission</Text>;
//      }
//      if (hasPermission === false) {
//        return <Text>No access to camera</Text>;
//      }
//      <BarCodeScanner
//          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
//          style={StyleSheet.absoluteFillObject}
//        />
//        {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}

//    if(isDemo) {
//        // polling to generate credential
//        useInterval(async () => {
//            console.log("Polling to create credentials");
//            setMadeCredential(createDemoCredential(chat,madeCredential))
//            if(madeCredential) {
//                let pendingMsgs = []
//                if(messages.length > 0) {
//                    pendingMsgs = getMessagesSince(chat,messages[messages.length-1]["id"]).resolve()
//                } else {
//                    pendingMsgs = getAllMessages(chat).resolve()
//                }
//                await setMessages((prevMessages) =>
//                    GiftedChat.append(prevMessages,pendingMsgs.map((pendingMsg) => mapMessage(pendingMsg))));
//                setMessages(messages.concat[pendingMsgs)
//            }
//        }, madeCredential ? null : 5000,);
//    }

    async function handleSend(pendingMsgs) {
        console.log("ChatScreen - handle send",pendingMsgs)
        const result = await sendMessages(chat, pendingMsgs, TEXT_MSG_TYPE, getUserItem(chat.id));
//        await setMessages((prevMessages) => GiftedChat.append(prevMessages, pendingMsgs));
    }

    //getFakePromiseAsync(10000);
//processQuickReply(chat,reply)
    async function handleQuickReply(reply) {
        console.log("ChatScreen - handle quick reply",reply)
        const pubChat = await processQuickReply(chat,reply)
        if(pubChat) {
            setChat(pubChat)
            console.log("ChatScreen - Quick Reply processing complete", pubChat)
        }
//        await setMessages((prevMessages) =>
//                GiftedChat.append(prevMessages,resultMessages.map((resultMessage) => mapMessage(resultMessage))));
    }

//function renderActions(props: Readonly<ActionsProps>) {
//    return (
//      <Actions
//        {...props}
//        options={{
//          ['Send Image']: handlePickImage,
//        }}
//        icon={() => (
//          <Icon name={'attachment'} size={28} color={AppTheme.colors.primary} />
//        )}
//        onSend={args => console.log(args)}
//      />
//    )
//  }

//#fad58b
  function renderBubble(props) {
    return (
        <Bubble
            {...props}
            wrapperStyle={{
                  left: {
                    backgroundColor: '#251520',
                  },
                }}
            textStyle={{
                left: {
                  color: '#fff',
                },
                right: {
                  color: '#000',
                },
            }}
//            textProps={{
//                            style: {
//                              color: props.position === 'left' ? '#fff' : '#000',
//                            },
//                        }}
        />
    );
  }

    function getSource(message) {
        //console.log("ChatScreen - getting source",message)
        if (message && message.currentMessage) {
          return message.currentMessage.audio ? message.currentMessage.audio : message.currentMessage.video ? message.currentMessage.video : null;
        }
        return null;
    }

//    function renderVideo(message) {
//      const source = getSource(message);
//      if (source) {
//        return (
//          <View style={styles.videoContainer} key={message.currentMessage._id}>
//            {Platform.OS === 'ios' ? <Video
//              style={styles.videoElement}
//              shouldPlay
//              height={156}
//              width={242}
//              muted={true}
//              source={{ uri: source }}
//              allowsExternalPlayback={false}></Video> : <VideoPlayer
//              style={styles.videoElement}
//              source={{ uri: source }}
//            />}
//          </View>
//        );
//      }
//      return <></>;
//    };

//    function renderActions(props: Readonly<ActionsProps>) {
//        return (
//          <Actions
//            {...props}
//            options={{
//              ['Send Image']: handlePickImage,
//            }}
//            icon={() => (
//              <Icon name={'attachment'} size={28} color={AppTheme.colors.primary} />
//            )}
//            onSend={args => console.log(args)}
//          />
//        )
//    }


    function renderInputToolbar(props) {
      //console.log("renderInputToolbar", props)
      return (
          <InputToolbar
              {...props}
                  containerStyle={{
                    backgroundColor: "#302025",
                    borderTopColor: "#dddddd",
                    borderTopWidth: 1,
                    padding: 1,
                  }}
                  textInputStyle={{ color: "white"}}
          />
      );
    }

//  function renderSystemMessage(props) {
//    const {
//      currentMessage: { text: currText },
//    } = props
//
//    let messageTextStyle
//
//    // Make "pure emoji" messages much bigger than plain text.
//    if (currText && emojiUtils.isPureEmojiString(currText)) {
//      messageTextStyle = {
//        fontSize: 28,
//        // Emoji get clipped if lineHeight isn't increased; make it consistent across platforms.
//        lineHeight: Platform.OS === 'android' ? 34 : 30,
//      }
//    }

//#4fcc96
//    return (
//            <Bubble
//                {...props}
//                wrapperStyle={{
//                  left: {
//                    backgroundColor: '#4fcc96',
//                    color: '#222222',
//                    fontWeight: 'bold',
//                  },
//                }}
//                textStyle={{ color: "white"}}
//            />
//        );
//  }

//  function renderMessageImage(props) {
//    console.log("ChatScreen - Rendering message image",props);
//    return (
//      <MessageImage
//        {...props}
//        style={styles.image}
//        source={require('../assets/LogoOnly1024.png')}
//      />
//    )
//  }

  if (loading) {
    console.log("Loading....")
    return <Loading />;
  }

//renderSystemMessage={renderSystemMessage}
//renderMessageVideo={renderVideo}
//{
//                                  type: "url",
//                                  style: styles.bigBlue,
//                                  onPress: (tag) => console.log(`Pressed on hashtag: ${tag}`),
//                                }
//                  {
//                    pattern: /#(\w+)/,
//                    style: styles.url,
//                    onPress: (tag) => console.log(`Pressed on hashtag: ${tag}`),
//                  },
//renderActions={renderActions}
  return (
    <View style={{ backgroundColor: "#251520", flex: 1, display: "flex",}}>
      <GiftedChat
          isTyping={processing}
          messages={messages.sort((a, b) => b.createdAt - a.createdAt)}
          onQuickReply={reply => handleQuickReply(reply)}
          onSend={messages => handleSend(messages)}
          parsePatterns={(linkStyle) => [
                  {
                      pattern: /published to Prism/,
                      style: styles.prism,
                      onPress: (tag) => setShowSystem(!showSystem),
                  },
                  {
                      pattern: /Show QR code/,
                      style: styles.qr,
                      onPress: (tag) => showQRModal(tag),
                  }
                  //{type: 'url', style: styles.url, onPress: onUrlPress},
                ]}

          renderInputToolbar={props => renderInputToolbar(props)}
          //renderActions={renderActions}
          renderAllAvatars={true}
          renderAvatarOnTop={true}
          renderBubble={renderBubble}
          renderUsernameOnMessage={true}
          showAvatarForEveryMessage={true}
          user={mapUser(getUserItem(chat.id))}
      />
    </View>
  );
  //      {
    //        Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />
    //      }

  //,      ...(message.type === BLOCKCHAIN_URI_MSG_TYPE) && {system: true}
  //<Text onPress={() => { alert('hello')}} style={{ fontStyle:'italic',color: 'red' }}>{}</Text>
  function mapMessage(message) {
      console.log("ChatScreen - Map message for gifted",message);
      mappedMsg={}
      mappedMsg["_id"] = message.id
      mappedMsg["text"] = message.body
      mappedMsg["createdAt"] = new Date(message.createdTime)
      mappedMsg["user"] = mapUser(getUserItem(message.user))
      if(message["image"]) {
        mappedMsg["image"] = message["image"]
      }
      if(message["quickReplies"]) {
        mappedMsg["quickReplies"] = message["quickReplies"]
      }
      mappedMsg["type"] = message.type
      if(message["system"]) {
        mappedMsg["system"] = (message.system)
        if(!showSystem) {
            mappedMsg["text"] = "more details available"
        }
      }
      //image: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_light_color_272x92dp.png',
      // You can also add a video prop:
      //video: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      // Mark the message as sent, using one tick
      //sent: true,
      // Mark the message as received, using two tick
      //received: true,
      // Mark the message as pending with a clock loader
      //pending: true,
      // Any additional custom parameters are passed through
    return mappedMsg;
  }

  function mapUser(user) {
    console.log("ChatScreen - Map User for gifted",user);
    return {
      _id: user.id,
      name: user.displayName,
      avatar: user.displayPictureUrl,
    };
  }

  function showQRModal(tag) {
    console.log("ChatScreen - Showing QR modal",tag)
    navigation.navigate('Show QR Code')
  }
}

const styles = StyleSheet.create({
    videoContainer: {
        marginTop: 50,
    },
    bigBlue: {
        color: 'blue',
        fontWeight: 'bold',
        fontSize: 30,
    },
    red: {
        color: 'red',
    },
    prism: {
      color: 'red',
    },
    qr: {
      color: 'orange',
    },
    url: {
      color: 'red',
      textDecorationLine: 'underline',
    },
    email: {
      textDecorationLine: 'underline',
    },

    text: {
      color: 'blue',
      fontSize: 15,
    },

    phone: {
      color: 'blue',
      textDecorationLine: 'underline',
    },

    name: {
      color: 'red',
    },

    username: {
      color: 'green',
      fontWeight: 'bold',
    },

    magicNumber: {
      fontSize: 42,
      color: 'pink',
    },

    hashTag: {
      fontStyle: 'italic',
    },
});