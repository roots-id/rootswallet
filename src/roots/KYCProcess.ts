import { getChatItem, getChatItems, sendMessage, MessageType, importContact, createChat, initRoot } from "."
import { createDIDPeer } from '../didpeer'
import * as store from '../store'
import * as models from '../models'
import * as contact from '../relationships'
import * as roots from '../roots';
import * as contacts from '../relationships'
import { kycCredentialRequest } from '../protocols';

import uuid from 'react-native-uuid'

export class KYCProcess {

    private chat: any
    private personalInfo: any[]

    constructor(chatId: string) {
        this.chat = roots.getChatItem(chatId)
        this.personalInfo = [
            {
                question: "What is your first name?",
                field: "first_name",
                value: null,
                type: "text"
            },
            {
                question: "What is your last name?",
                field: "last_name",
                value: null,
                type: "text"
            },
            {
                question: "Please, provide your email",
                field: "email",
                value: null,
                type: "text"
            },
            {
                question: "Please, take a picture of you face, like in a selfie.",
                field: "selfie",
                value: null,
                type: "picture"
            },
            {
                question: "Please, take a picture of your ID card.",
                field: "front",
                value: null,
                type: "picture"
            }
        ]

        console.log("CONSTRUCTOR KYC PROCESS")
        console.log(this.chat.fromDids[0])
        console.log(this.chat.toDids[0])

        roots.sendMessage(this.chat, 'Please, provide the following information:',
            roots.MessageType.TEXT,
            contacts.ROOTS_BOT)
        this.askNExtQuestion()

    }

    async handleTextInput(text: string) {

        console.log("KYC TEXT IMPUT", text)
        for (let p of this.personalInfo) {
            if (p.value === null) {
                p.value = text
                break
            }
        }
        await this.askNExtQuestion()
    }

    async askNExtQuestion() {
        for (let p of this.personalInfo) {
            if (p.value === null && p.type === "text") {
                await roots.sendMessage(this.chat, p.question,
                    roots.MessageType.TEXT,
                    contacts.ROOTS_BOT)
                break
            } else if (p.value === null && p.type === "picture" && p.field === "selfie") {
                await roots.sendMessage(this.chat, p.question,
                    roots.MessageType.KYC_SELFIE,
                    contacts.ROOTS_BOT)
                break
            } else if (p.value === null && p.type === "picture" && p.field === "front") {
                await roots.sendMessage(this.chat, p.question,
                    roots.MessageType.KYC_FRONT_PICTURE,
                    contacts.ROOTS_BOT)
                break
            }
        }
    }

    async processSelfiePicture(response: any) {
        console.log("KYC SELFIE RECEIVED")
        for (let p of this.personalInfo) {
            if (p.field === "selfie") {
                p.value = response.assets[0].base64
                break
            }
        }
        await this.askNExtQuestion()
    }
    
    async processFrontPicture(response: any) {
        console.log("KYC FRONT RECEIVED")
        for (let p of this.personalInfo) {
            if (p.field === "front") {
                p.value = response.assets[0].base64
                break
            }
        }
        await roots.sendMessage(this.chat, "We are processing the information and we'll send a credential back with the result. Please wait.",
            roots.MessageType.TEXT,
            contacts.ROOTS_BOT)
        await this.requestCredential()

    }

    async requestCredential(){
        console.log("KYC GENERATING CREDENTIAL REQUEST")
        console.log(this.chat.fromDids[0])
        console.log(this.chat.toDids[0])
        


        let credential = {
                credential: {
                    id: "",
                    name: "KYC Credential",
                    issuer: "",
                    issuanceDate: "",
                    credentialSubject: {
                        id: "did:prism",//roots.getDid('DID'),
                        first_name: this.personalInfo[0].value,
                        last_name: this.personalInfo[1].value,
                        email: this.personalInfo[2].value,
                    }
                }
            }
        
        await kycCredentialRequest(this.chat.fromDids[0],this.chat.toDids[0], credential, this.personalInfo[3].value, this.personalInfo[4].value)
    }
}
