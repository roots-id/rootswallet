import React, { useContext, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, NativeModules, StyleSheet, Text, View } from 'react-native';
import { Actions, ActionsProps, Bubble, ChatInput,
    Composer, GiftedChat, InputToolbar, Message, SendButton } from 'react-native-gifted-chat';

//import { Video, VideoPlayer } from 'react-native-video'
//import { useInterval } from 'usehooks-ts'
//import { BarCodeScanner } from 'expo-barcode-scanner';
//import emojiUtils from 'emoji-utils';
import { showQR } from '../qrcode'
import {getRelItem,YOU_ALIAS} from '../relationships'
import * as roots from '../roots';
import Loading from '../components/Loading';

const { PrismModule } = NativeModules;

export default function ChatScreen({ route, navigation }) {
    console.log("ChatScreen - route params",route.params)
//  const [ user, setUser ] = useState(user);
    const [chat, setChat] = useState(roots.getChatItem(route.params.chatId));
    console.log("ChatScreen - got chatItem ",chat)
//    const [hasPermission, setHasPermission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [madeCredential, setMadeCredential] = useState(false)
    const [messages, setMessages] = useState([]);
    const [processing, setProcessing] = useState(false)
//    const [scanned, setScanned] = useState(false);
    const [showSystem, setShowSystem] = useState(false)

    useEffect(() => {
        console.log("ChatScreen - useEffect",chat)
        const chatSession = roots.startChatSession({
            chat: chat,
            onReceivedMessage: (message) => {
                setMessages((currentMessages) =>
                    GiftedChat.append(currentMessages, [mapMessage(message)])
                );
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
                setProcessing(processing)
                console.log("updated processing indicator",processing)
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
            {chatSession.end}
    }, [chat]);

    useEffect(() => {
    }, [messages]);

//    useEffect(() => {
//        console.log("ChatScreen - Checked Processing",processing)
//    }, [processing]);

    useEffect(() => {
        console.log("ChatScreen - getting all messages")
        const msgs = roots.getMessages(chat.id)
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
    function bubblePressed(context,message) {
        console.log("context",context,"message",message)
    }

    async function handleSend(pendingMsgs) {
        console.log("ChatScreen - handle send",pendingMsgs)
        const result = await roots.sendMessages(chat, pendingMsgs, roots.TEXT_MSG_TYPE, getRelItem(YOU_ALIAS));
//        await setMessages((prevMessages) => GiftedChat.append(prevMessages, pendingMsgs));
    }

    //getFakePromiseAsync(10000);
//processQuickReply(chat,reply)
    async function handleQuickReply(replies) {
        console.log("ChatScreen - Processing Quick Reply w/ chat",chat.id,"w/ replies",replies.length)
        roots.isProcessing(chat.id)
        if(replies) {
            replies.forEach(async (reply) =>
            {
                console.log("ChatScreen - processing quick reply",chat.id,reply)
                if(reply.value.startsWith(roots.PROMPT_PUBLISH_MSG_TYPE)) {
                    console.log("ChatScreen - process quick reply to publish DID")
                    if(reply.value.endsWith(roots.PUBLISH_DID)) {
                        console.log("ChatScreen - publishing DID w/alias",chat.fromAlias)
                        const pubChat = await roots.processPublishResponse(chat,reply)
                        setChat(pubChat)
                    } else {
                        console.log("ChatScreen - not publishing DID")
                    }
                } else if(reply.value.startsWith(roots.PROMPT_OWN_DID_MSG_TYPE)) {
                    console.log("ChatScreen - quick reply view did")
                    const longDid = roots.getMessageById(reply.messageId).data
                    console.log("View rel",longDid);
                    showQR(navigation,longDid)
                } else if(reply.value.startsWith(roots.PROMPT_ACCEPT_CREDENTIAL_MSG_TYPE)) {
                    console.log("ChatScreen - process quick reply for accepting credential")
                    const res = await roots.processCredentialResponse(chat,reply)
                    console.log("ChatScreen - credential accepted?",res)
                } else if(reply.value.startsWith(roots.PROMPT_OWN_CREDENTIAL_MSG_TYPE)) {
                    console.log("ChatScreen - process quick reply for owned credential")
                    if (reply.value.endsWith(roots.CRED_VERIFY)) {
                        console.log("ChatScreen - quick reply verify credential",)
                        const verify = await roots.verifyCredential(chat, reply)
                        console.log("ChatScreen - credential verification result",verify)
                    } else if (reply.value.endsWith(roots.CRED_VIEW)) {
                        console.log("ChatScreen - quick reply view credential")
                        const cred = await roots.getImportedCredByMsgId(reply.messageId)
                        showQR(navigation,cred)
                    }
                } else if(reply.value.startsWith(roots.PROMPT_SHAREABLE_REL_MSG_TYPE)) {
                  console.log("ChatScreen - quick reply shareable rel")
                  const rel = roots.getMessageById(reply.messageId).data
                  if(rel) {
                      const relJson = JSON.stringify(rel)
                      console.log("View shareable",relJson);
                      showQR(navigation,relJson)
                  }else {
                    console.log("Could not show undefined shareable",rel)
                  }
                }else {
                    console.log("ChatScreen - reply value not recognized, was",chat.id,reply.value)
                    return;
                }
            });
        } else {
            console.log("ChatScreen - reply",replies,"or chat",chat,"were undefined")
            return;
        }
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

    function processBubbleClick(context,message) {
        console.log("bubble pressed",context,message)
        switch(message.type) {
            case roots.BLOCKCHAIN_URL_MSG_TYPE:
                console.log("Clicked blockchain url msg",message.data)
                Linking.openURL(message.data)
                break;
            case roots.DID_MSG_TYPE:
                console.log("Clickable did msg",message.data)
                showQR(navigation,message.data)
            default:
                console.log("Clicked non-active message type",message.type)
        }
    }

//#fad58b
  function renderBubble(props) {
    //console.log("render bubble with props",props.currentMessage)
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
          onPress={ (context, message) => processBubbleClick(context,message)}
          onQuickReply={reply => handleQuickReply(reply)}
          onSend={messages => handleSend(messages)}
//          onPress: (tag) => setShowSystem(!showSystem),
//          {
//              pattern: /Your DID was added to Prism/,
//              style: styles.prism,
//              onPress: (tag) => setShowSystem(!showSystem),
//          },
          parsePatterns={(linkStyle) => [
                {
                      pattern: /RootsWallet/,
                      style: styles.rootswallet,
                      onPress: (tag) => console.log("Pressed RootsWallet"),
                  },
                {
                      pattern: /Cardano/,
                      style: styles.cardano,
                      onPress: (tag) => console.log("Pressed Cardano"),
                  },
                  {
                        pattern: /Prism/,
                        style: styles.prism,
                        onPress: (tag) => console.log("Pressed Prism"),
                    },
                  {
                      pattern: /Your DID was added to Prism/,
                      style: styles.prism,
                      onPress: (tag) => console.log("Pressed DID added message"),
                  },
                  {
                      pattern: /Show Chat QR code/,
                      style: styles.qr,
                      onPress: (tag) => showQR(navigation,roots.getDid(chat.fromAlias).uriLongForm),
                  },
                 {
                     pattern: /did:prism:[\S]*/,
                     style: styles.prism,
                     onPress: (tag) => showQR(navigation,tag),
                 },
                 {
                    type: 'url',
                    style: styles.clickableListTitle,
                    onPress: (tag) => Linking.openURL(tag),
                },
                {
                    pattern: /Click to see the Cardano blockchain details/,
                    style: styles.prism,
                }
          ]}
          //quickReplyStyle={{backgroundColor: '#e69138',borderColor: '#e69138',elevation: 3}}
          placeholder={"Make a note..."}
          renderInputToolbar={props => renderInputToolbar(props)}
          //renderActions={renderActions}
          renderAllAvatars={true}
          renderAvatarOnTop={true}
          renderBubble={renderBubble}
          renderQuickReplySend={() => <Text style={{color: '#e69138',fontSize: 18}}>Confirm</Text>}
          renderUsernameOnMessage={true}
          showAvatarForEveryMessage={true}
          user={mapUser(getRelItem(chat.id))}
      />
    </View>
  );
  //      {
    //        Platform.OS === 'android' && <KeyboardAoidingView behavior="padding" />
    //      }

  //,      ...(message.type === BLOCKCHAIN_URI_MSG_TYPE) && {system: true}
  //<Text onPress={() => { alert('hello')}} style={{ fontStyle:'italic',color: 'red' }}>{}</Text>
  function mapMessage(message) {
      console.log("ChatScreen - Map message for gifted",message);
      mappedMsg={}
      mappedMsg["_id"] = message.id
      mappedMsg["text"] = message.body
      mappedMsg["createdAt"] = new Date(message.createdTime)
      mappedMsg["user"] = mapUser(getRelItem(message.rel))
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
      if(message["data"]) {
        mappedMsg["data"] = message["data"]
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

  function mapUser(rel) {
    console.log("ChatScreen - Map User for gifted",rel);
    return {
      _id: rel.id,
      name: rel.displayName,
      avatar: rel.displayPictureUrl,
    };
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