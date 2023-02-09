import React, {useEffect, useState} from 'react';
import {Linking, Text, View} from 'react-native';
import {Bubble, GiftedChat, IMessage, InputToolbar, InputToolbarProps, Reply, User} from 'react-native-gifted-chat';

import * as contacts from '../relationships'
import * as models from "../models";
import {showQR} from '../qrcode'
import { getContactByAlias, getContactByDid, showRel} from '../relationships'
import * as roots from '../roots';
import Loading from '../components/Loading';
import {styles} from "../styles/styles";
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import {BubbleProps} from "react-native-gifted-chat/lib/Bubble";
import { checkMessages, createOOBInvitation, requestMediate, sendBasicMsg, retrieveMessagesFromMediator } from '../roots/peerConversation';
import { storeItem } from '../store/CachedStore';
import { KYCProcess } from '../roots/KYCProcess';
import {launchCamera} from 'react-native-image-picker';


export default function ChatScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("ChatScreen - route params", route.params)
    const [chat, setChat] = useState<models.chat>(roots.getChatItem(route.params.chatId));
    const [contact, setContact] = useState<models.contactDecorator>();
    console.log("ChatScreen - got chatItem ", chat)
    const [loading, setLoading] = useState<boolean>(true);
    const [messages, setMessages] = useState<IMessage[]>();
    const [processing, setProcessing] = useState<boolean>(false)

    const [requesting_credentials, setRequestingCredentials] = useState<boolean>(false)
    const [request_data, setRequestData] = useState<any>(null)
    const [requested_credentials, setRequestedCredentials] = useState<any>(null)
    const [kyc_process, setKYCProcess] = useState<KYCProcess | null>(null)
    // {
    //     'first_name': 'John',
    //     'last_name': 'Doe',
    //     'date_now': '2021-01-01'
    // }
    //const [showSystem, setShowSystem] = useState<boolean>(false)

    useEffect(() => {
        console.log("ChatScreen - chat set", chat)
        const chatSession = roots.startChatSession(chat.id, {
            chat: chat,
            onReceivedMessage: (message) => {
                if (message && GiftedChat) {
                    setMessages((currentMessages) => {
                        const iMsg = mapMessage(message)
                        if (iMsg) {
                            return GiftedChat.append(currentMessages, [iMsg])
                        }
                    });
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
        const result = await roots.sendMessages(chat, pendingMsgs.map(msg => msg.text), roots.MessageType.TEXT, contacts.getUserId());
//        await setMessages((prevMessages) => GiftedChat.append(prevMessages, pendingMsgs));
        // Try sending a basicmessage (only first msg of the arraya)
        // TODO check if chat inlcudes basic message
        let text = pendingMsgs.map(msg => msg.text)[0].toLowerCase()
        let textUnaltered = pendingMsgs.map(msg => msg.text)[0]

        //check if text contains "iiw" and "request" and "credential"
        if (text.includes("iiw") && text.includes("request") && text.includes("credential")) {
            setRequestingCredentials(true)
            const result = await roots.sendMessages(chat, ['Provide your first name'], roots.MessageType.TEXT, contacts.ROOTS_BOT);
            setRequestData(null)
        } else if(text.includes("jff")){
            
            // const result = await roots.sendMessages(chat, ['Provide your first name'], roots.MessageType.TEXT, contacts.ROOTS_BOT);
            const result = await roots.sendMessage(chat,
                 'Preview your credential below',
                  roots.MessageType.JFFCREDENTIAL, 
                  contacts.ROOTS_BOT,
                  false)
        
        // check if requesting_credentials is true and if request_data is undefined

        } else if (requesting_credentials && request_data == null) {
            setRequestData({
                'first_name': text,
                'last_name': '',
            })
            const result = await roots.sendMessages(chat, ['Provide your last name'], roots.MessageType.TEXT, contacts.ROOTS_BOT);
            console.log("ChatScreen - request_data", request_data)
        }  else if (requesting_credentials && request_data != null){
        // check if requesting_credentials is true and if request_data is defined
        
            let _temp_request_data = request_data
            _temp_request_data['last_name'] = text
            setRequestData(_temp_request_data)
            console.log("ChatScreen - request_data", request_data)
            const result = await roots.sendMessage(chat, 'Preview your credential below', roots.MessageType.IIWCREDENTIAL, contacts.ROOTS_BOT,false, _temp_request_data)
            setRequestingCredentials(false)
            setRequestData(null)
        } else if (kyc_process !== null){
            kyc_process.handleTextInput(textUnaltered)
        } else {

            console.log("ChatScreen - sending basic message", text)
            sendBasicMsg(chat.id, pendingMsgs.map(msg => msg.text)[0])
        }
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
                    const r = roots.getMessageById(reply.messageId)?.data
                    console.log("ChatScreen - View rel", r);
                    showRel(navigation, r)
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
                            navigation.navigate('Credential Details', {cred: vCred})
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
                            navigation.navigate('Credential Details', {cred: vCred})
                        }
                    }
                } else if (reply.value.startsWith(roots.MessageType.PROMPT_RETRY_PROCESS)) {
                    console.log("ChatScreen - process quick reply for retry process")
                    const process = roots.getMessageById(reply.messageId)?.data
                    process();
                } else if (reply.value === roots.MessageType.MEDIATOR_REQUEST_MEDIATE) {
                    await requestMediate(chat.id)
                } else if (reply.value === roots.MessageType.MEDIATOR_STATUS_REQUEST) {
                    await checkMessages(chat.id)
                } else if (reply.value === roots.MessageType.MEDIATOR_KEYLYST_UPDATE) {
                    await createOOBInvitation(chat.id)
                } else if (reply.value === roots.MessageType.MEDIATOR_RETRIEVE_MESSAGES) {
                    await retrieveMessagesFromMediator(chat.id)
                } else if (reply.value === roots.MessageType.SHOW_QR_CODE) {
                    await showQR(navigation, roots.getMessageById(reply.messageId)?.data.url)
                } else if (reply.value === roots.MessageType.JFFCREDENTIAL) {
                    //
                    const result = await roots.sendMessage(chat,
                        'Preview your credential below',
                         roots.MessageType.JFFCREDENTIAL, 
                         contacts.ROOTS_BOT,
                         false)
                } else if (reply.value === roots.MessageType.JFFCREDENTIAL +roots.CRED_VIEW) {
                    let jffcred = await roots.createJFFcredential()
                    setRequestedCredentials(jffcred)
                    console.log('jffcred', jffcred)
                    navigation.navigate("Display Custom Credential", {credential: jffcred})
                    await roots.sendMessage(chat, 'Accept or Deny credential jff', roots.MessageType.JFFCREDENTIALREQUEST, contacts.ROOTS_BOT, false, jffcred)

                } else if (reply.value === roots.MessageType.JFFACCEPTEDCREDENTIAL ) {
                    console.log('CREDENTIAL ACCEPTED')
                    //TODO: replace with credentialRequest()

                    await roots.sendMessage(chat, 'JFF credential accepted.',
                    roots.MessageType.TEXT,
                    contacts.ROOTS_BOT)
                    //TODO save credential to

                    storeItem('demo_jffcredential', JSON.stringify(requested_credentials))
                    setRequestedCredentials(null)

                } else if (reply.value === roots.MessageType.IIWCREDENTIAL +roots.CRED_VIEW) {
                    const process = roots.getMessageById(reply.messageId)?.data
                    let _temp_name = process.first_name + ' ' + process.last_name
                    // let credIIW = await roots.createIIWcredential(_temp_name)
                    let credIIW = await roots.requestIIWCredential(chat.id,_temp_name)
                    console.log("ChatScreen - JFFCREDD", credIIW)
                    setRequestedCredentials(credIIW)
                    //TODO: replace with credentialRequest()
                    navigation.navigate("Display Custom Credential", {credential: credIIW})
                    await roots.sendMessage(chat, 'Accept or Deny credential iiw', roots.MessageType.IIWCREDENTIALREQUEST, contacts.ROOTS_BOT)

                } else if (reply.value === roots.MessageType.IIWACCEPTEDCREDENTIAL ) {
                    console.log('CREDENTIAL ACCEPTED')
                    storeItem('demo_iiwcredential', JSON.stringify(requested_credentials))
                    setRequestedCredentials(null)

                    //TODO: replace with credentialRequest()

                    await roots.sendMessage(chat, 'IIW credential accepted.',
                    roots.MessageType.TEXT,
                    contacts.ROOTS_BOT)
                } else if (reply.value === roots.MessageType.IIWREJECTEDCREDENTIAL) {
                    console.log('CREDENTIAL REJECTED')
                    await roots.sendMessage(chat, 'IIW credential denied.',
                    roots.MessageType.TEXT,
                    contacts.ROOTS_BOT)
                } else if (reply.value === roots.MessageType.AP2_CREDENTIAL_OFFER_ACCEPTED){
                    console.log('CREDENTIAL OFFER ACCEPTED')
                    await roots.sendMessage(chat, 'Credential offer accepted.',
                    roots.MessageType.TEXT,
                    contacts.ROOTS_BOT)
                    const offer = roots.getMessageById(reply.messageId)?.data
                    await roots.requestAP2Credential(chat.id,offer)

                } else if (reply.value === roots.MessageType.AP2_CREDENTIAL_OFFER_DENIED){
                    console.log('CREDENTIAL OFFER DENIED')
                    await roots.sendMessage(chat, 'Credential offer denied.',
                    roots.MessageType.TEXT,
                    contacts.ROOTS_BOT)
                } else if (reply.value === roots.MessageType.AP2_CREDENTIAL_ISSUED_ACCEPTED){
                    console.log('CREDENTIAL ISSUED ACCEPTED')
                    await roots.sendMessage(chat, 'Credential accepted.',
                    roots.MessageType.TEXT,
                    contacts.ROOTS_BOT)
                    const cred = roots.getMessageById(reply.messageId)?.data
                    storeItem('ap2_credential', JSON.stringify(cred))
                    setRequestedCredentials(null)

                } else if (reply.value === roots.MessageType.AP2_CREDENTIAL_ISSUED_DENIED){
                    console.log('CREDENTIAL ISSUED DENIED')
                    await roots.sendMessage(chat, 'Credential denied.',
                    roots.MessageType.TEXT,
                    contacts.ROOTS_BOT)
                } else if (reply.value === roots.MessageType.KYC_START_ACCEPTED){
                    console.log('STARTING KYC PROCESS')

                    try {
                        setKYCProcess(new KYCProcess(chat.id))
                    } catch (error) {
                        console.log('KYC ERROR', error)
                    }
                } else if (reply.value === roots.MessageType.KYC_FRONT_PICTURE_ACCEPTED){
                    console.log('Taking picture')
                    if (kyc_process !== null ){await launchCamera(
                        {
                            mediaType: 'photo',
                            cameraType: 'front',
                            includeBase64: true,
                            saveToPhotos: false,
                            presentationStyle: 'currentContext'
                        }, 
                        async (response) => {
                            await kyc_process?.processFrontPicture(response)
                        }
                    )}
                } else if (reply.value === roots.MessageType.KYC_SELFIE_ACCEPTED){
                    console.log('Taking picture')
                    if (kyc_process !== null ){await launchCamera(
                        {
                            mediaType: 'photo',
                            cameraType: 'front',
                            includeBase64: true,
                            saveToPhotos: false,
                            presentationStyle: 'currentContext'
                        }, 
                        async (response) => {
                            await kyc_process?.processSelfiePicture(response)
                        }
                    )}
                   

                } else {
                    console.log("ChatScreen - reply value not recognized, was", chat.id, reply.value);
                } 
            }
        } else {
            console.log("ChatScreen - reply", replies, "or chat", chat, "were undefined");
        }
    }

    function processBubbleClick(context: any, message: IMessage): void {
        console.log("ChatScreen - bubble pressed", context, message)
        const msg = roots.getMessageById(message._id.toString())
        if (msg) {
            switch (msg.type) {
                case roots.MessageType.BLOCKCHAIN_URL:
                    console.log("ChatScreen - Clicked blockchain url msg", msg.data)
                    Linking.openURL(msg.data)
                    break;
                case roots.MessageType.DID:
                    console.log("ChatScreen - Clickable did msg", msg.data)
                    const c = getContactByDid(msg.data)
                    if (c) {
                        showQR(navigation, c)
                    }
                    break;
                default:
                    console.log("ChatScreen - Clicked non-active message type", msg.type)
            }
        }
    }

//#fad58b
    function renderBubble(props: BubbleProps<IMessage>) {
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

    function renderInputToolbar(props: InputToolbarProps<IMessage>) {
        //console.log("renderInputToolbar", props)
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: "#604050",
                    borderTopColor: "#dddddd",
                    borderTopWidth: 1,
                    padding: 1,
                }}
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
                inverted={false}
                messages={messages?.sort((a, b) => {
                    return (a.createdAt < b.createdAt) ? -1 : 1
                })}
                onPress={(context, message) => processBubbleClick(context, message)}
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
                        style: styles.red,
                    }
                ]}
                //quickReplyStyle={{backgroundColor: '#e69138',borderColor: '#e69138',elevation: 3}}
                placeholder={"Make a note..."}
                renderInputToolbar={props => renderInputToolbar(props)}
                //renderActions={renderActions}
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
            createdAt: message.createdTime,
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

    function mapUser(rel: models.contactDecorator | undefined): User {
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
