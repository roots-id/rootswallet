import React, {useEffect, useState} from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {Bubble, GiftedChat, IMessage, InputToolbar, Reply, User} from 'react-native-gifted-chat';

import * as cred from '../credentials'
import * as models from "../models";
import {showQR} from '../qrcode'
import {getContactByAlias, YOU_ALIAS} from '../relationships'
import * as roots from '../roots';
import Loading from '../components/Loading';
import styles from "../styles/styles";

export default function ChatScreen({route, navigation}) {
    console.log("ChatScreen - route params", route.params)
    const [chat, setChat] = useState<models.chat>(roots.getChatItem(route.params.chatId));
    const [contact, setContact] = useState<models.contact>();
    console.log("ChatScreen - got chatItem ", chat)
    const [loading, setLoading] = useState<boolean>(true);
    const [messages, setMessages] = useState<IMessage[]>();
    const [processing, setProcessing] = useState<boolean>(false)
    //const [showSystem, setShowSystem] = useState<boolean>(false)

    useEffect(() => {
        console.log("ChatScreen - chat set", chat)
        const chatSession = roots.startChatSession(chat.id, {
            chat: chat,
            onReceivedMessage: (message) => {
                setMessages((currentMessages) => {
                    const iMsg = mapMessage(message)
                    if (iMsg) {
                        return GiftedChat.append(currentMessages, [iMsg])
                    }
                });
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
                console.log("ChatScreen - updated processing indicator", processing)
            },
        });
        if (chatSession.succeeded) {
            console.log("ChatScreen - chat session started successfully")
        } else {
            console.error("ChatScreen - chat session failed", chatSession.error)
        }

        setContact(getContactByAlias(chat.id));
        console.log("ChatScreen - getting all messages")
        const msgs = roots.getMessagesByChat(chat.id)
        console.log("ChatScreen - got", msgs.length, "msgs")
        //msgs.forEach(msg => console.log("ChatScreen - got msg w/keys",Object.keys(msg)))
        const mapMsgs = msgs.map((msg) => {
            return mapMessage(msg)
        })
        setMessages(mapMsgs);
        setLoading(false);
        return () => {
            chatSession.end
        }
    }, [chat]);

    useEffect(() => {
    }, [messages]);

    // useEffect(() => {
    //     console.log("ChatScreen - getting all messages")
    //     const msgs = roots.getMessagesByChat(chat.id)
    //     console.log("ChatScreen - got",msgs.length,"msgs")
    //     msgs.forEach(msg => console.log("ChatScreen - got msg w/keys",Object.keys(msg)))
    //     //const msgs = {paginator: {items: }}
    //     const sMsgs = msgs.filter(msg => { const mapMsg = mapMessage(msg);if(mapMsg){return true}});
    //     if(sMsgs) {
    //         setMessages(sMsgs);
    //     }
    //     setLoading(false);
    // }, [showSystem]);

    function bubblePressed(context: any, message: any) {
        console.log("ChatScreen - context", context, "message", message)
    }

    async function handleSend(pendingMsgs: IMessage[]) {
        console.log("ChatScreen - handle send", pendingMsgs)
        const result = await roots.sendMessages(chat, pendingMsgs.map(msg => msg.text), roots.MessageType.TEXT, YOU_ALIAS);
//        await setMessages((prevMessages) => GiftedChat.append(prevMessages, pendingMsgs));
    }

    async function handleQuickReply(replies: Reply[]) {
        console.log("ChatScreen - Processing Quick Reply w/ chat", chat.id, "w/ replies", replies.length)
        roots.updateProcessIndicator(chat.id)
        if (replies) {
            for (const reply of replies) {
                console.log("ChatScreen - processing quick reply", chat.id, reply)
                if (reply.value.startsWith(roots.MessageType.PROMPT_PUBLISH)) {
                    console.log("ChatScreen - process quick reply to publish DID")
                    if (reply.value.endsWith(roots.PUBLISH_DID)) {
                        console.log("ChatScreen - publishing DID w/alias", chat.fromAlias)
                        const pubChat = await roots.processPublishResponse(chat)
                        if (pubChat) {
                            setChat(pubChat)
                        }
                    } else {
                        console.log("ChatScreen - not publishing DID")
                    }
                } else if (reply.value.startsWith(roots.MessageType.PROMPT_OWN_DID)) {
                    console.log("ChatScreen - quick reply view did")
                    const longDid = roots.getMessageById(reply.messageId)?.data
                    console.log("ChatScreen - View rel", longDid);
                    showQR(navigation, longDid)
                } else if (reply.value.startsWith(roots.MessageType.PROMPT_ACCEPT_CREDENTIAL)) {
                    console.log("ChatScreen - process quick reply for accepting credential")
                    const res = await roots.processCredentialResponse(chat, reply)
                    console.log("ChatScreen - credential accepted?", res)
                } else if (reply.value.startsWith(roots.MessageType.PROMPT_ISSUED_CREDENTIAL)) {
                    if (reply.value.endsWith(roots.CRED_REVOKE)) {
                        console.log("ChatScreen - process quick reply for revoking credential")
                        const res = await roots.processRevokeCredential(chat, reply)
                        console.log("ChatScreen - credential revoked?", res)
                    } else if (reply.value.endsWith(roots.CRED_VIEW)) {
                        console.log("ChatScreen - quick reply view issued credential")
                        const vCred = roots.processViewCredential(reply.messageId)
                        if (vCred) {
                            navigation.navigate('Credential Details', {cred: cred.getCredDetails(vCred.verifiedCredential)})
                        }
                    }
                } else if (reply.value.startsWith(roots.MessageType.PROMPT_OWN_CREDENTIAL)) {
                    console.log("ChatScreen - process quick reply for owned credential")
                    if (reply.value.endsWith(roots.CRED_VERIFY)) {
                        console.log("ChatScreen - quick reply verify credential",)
                        const credHash = roots.getMessageById(reply.messageId)?.data
                        console.log("ChatScreen - verifying credential with hash", credHash)
                        await roots.processVerifyCredential(chat, credHash)
                    } else if (reply.value.endsWith(roots.CRED_VIEW)) {
                        console.log("ChatScreen - quick reply view imported credential")
                        const vCred = roots.processViewCredential(reply.messageId)
                        if (vCred) {
                            navigation.navigate('Credential Details', {cred: cred.getCredDetails(vCred.verifiedCredential)})
                        }
                    }
                } else {
                    console.log("ChatScreen - reply value not recognized, was", chat.id, reply.value);
                }
            }
        } else {
            console.log("ChatScreen - reply", replies, "or chat", chat, "were undefined");
        }
    }

    function processBubbleClick(context: any, message: { type: roots.MessageType; data: string; }): void {
        console.log("ChatScreen - bubble pressed", context, message)
        switch (message.type) {
            case roots.MessageType.BLOCKCHAIN_URL:
                console.log("ChatScreen - Clicked blockchain url msg", message.data)
                Linking.openURL(message.data)
                break;
            case roots.MessageType.DID:
                console.log("ChatScreen - Clickable did msg", message.data)
                showQR(navigation, message.data)
                break;
            default:
                console.log("ChatScreen - Clicked non-active message type", message.type)
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
                textInputStyle={{color: "white"}}
            />
        );
    }


    if (loading) {
        console.log("ChatScreen - Loading....")
        return <Loading/>;
    }

    return (
        <View style={{backgroundColor: "#251520", flex: 1, display: "flex",}}>
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
                //                {
                //                      pattern: /RootsWallet/,
                //                      style: styles.rootswallet,
                //                      onPress: (tag) => console.log("Pressed RootsWallet"),
                //                  },
                //                {
                //                      pattern: /Cardano/,
                //                      style: styles.cardano,
                //                      onPress: (tag) => console.log("Pressed Cardano"),
                //                  },
                //                  {
                //                        pattern: /Prism/,
                //                        style: styles.prism,
                //                        onPress: (tag) => console.log("Pressed Prism"),
                //                    },
                //,
                //                  {
                //                      pattern: /Show Chat QR code/,
                //                      style: styles.qr,
                //                      onPress: (tag) => showQR(navigation,roots.getDid(chat.fromAlias).uriLongForm),
                //                  }
                //,
                //                 {
                //                     pattern: /did:prism:[\S]*/,
                //                     style: styles.prism,
                //                     onPress: (tag) => showQR(navigation,tag),
                //                 }

                //                  {
                //                      pattern: /Your DID was added to Prism/,
                //                      style: styles.prism,
                //                      onPress: (tag) => console.log("Pressed DID added message"),
                //                  },
                parsePatterns={(linkStyle) => [
                    {
                        type: 'url',
                        style: styles.clickableListTitle,
                        onPress: (tag: string) => Linking.openURL(tag),
                    },
                    {
                        pattern: /\*Click to geek out on Cardano blockchain details\*/,
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
                renderQuickReplySend={() => <Text style={{color: '#e69138', fontSize: 18}}>Confirm</Text>}
                renderUsernameOnMessage={true}
                showAvatarForEveryMessage={true}
                user={mapUser(contact)}
            />
        </View>
    );
    //      {
    //        Platform.OS === 'android' && <KeyboardAoidingView behavior="padding" />
    //      }

    function mapMessage(message: models.message): IMessage {
        console.log("ChatScreen - Map message for gifted", message);
        const image = message.image
        const user = getContactByAlias(message.rel)
        const mappedMsg: IMessage = {
            _id: message.id,
            createdAt: new Date(message.createdTime),
            system: message.system,
            text: message.body,
            user: mapUser(user),
        }
        if (message.image) {
            mappedMsg.image = message.image
        }
        if (message.quickReplies) {
            mappedMsg.quickReplies = message.quickReplies
        }
        // if(message.system) {
        //     console.log("ChatScreen - message is system message",message.system)
        //     if(!showSystem) {
        //         console.log("ChatScreen - not showing system message details",message.system)
        //         mappedMsg.text = "more details available"
        //     }
        // }
        console.log("ChatScreen - got mapped message", mappedMsg);
        return mappedMsg;
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
    }

    function mapUser(rel: models.contact | undefined): User {
        console.log("ChatScreen - Map User for gifted", rel);
        let user: User;
        if (rel) {
            user = {
                _id: rel.id,
                name: rel.displayName,
                avatar: rel.displayPictureUrl,
            };
        } else {
            console.error("Unable to map user", rel)
            user = {
                _id: "",
                name: "",
                avatar: "",
            };
        }

        console.log("ChatScreen - mapped user is", user)
        return user;
    }
}