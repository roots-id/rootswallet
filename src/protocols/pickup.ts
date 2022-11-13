import {logger} from "../logging";
import { sendDIDCommMessage, pack, receiveMessage } from "../didcommv2";

export async function retrieveMessages(from: string, to: string){
    try {
        const messageCount = await statusRequest(from, to)
        logger("Pickup message count: "+messageCount)
        if (messageCount>0){
            const attachments = await deliveryRequest(messageCount,from, to)
            await processDelivery(attachments, from, to)
        } 
        return messageCount
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

export async function statusRequest(from: string, to: string) {
    try {
        const msgPacked = await pack(
            {}, 
            from, 
            to, 
            "https://didcomm.org/messagepickup/3.0/status-request", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendDIDCommMessage(msgPacked, to)
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

export async function deliveryRequest(limit: number, from: string, to: string) {
    try {
        const msgPacked = await pack(
            {limit: parseInt(limit.toString())}, 
            from, 
            to, 
            "https://didcomm.org/messagepickup/3.0/delivery-request", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendDIDCommMessage(msgPacked, to)
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

export async function messageReceived(ids: string[], from: string, to: string) {
    try {
        const msgPacked = await pack(
            {message_id_list: ids}, 
            from, 
            to, 
            "https://didcomm.org/messagepickup/3.0/messages-received", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendDIDCommMessage(msgPacked, to)
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

 async function processDelivery(attachments: any[], from: string, to: string) {
    try {
        attachments.forEach(async function (attachment) {
            const msgPacked = attachment.data.json
            const msgId = attachment.id
            await messageReceived([msgId], from, to)
            receiveMessage(msgPacked)
        })
    } catch (error: any) {
        logger("pickup - Error", error)
    }
}

export async function receivePickup(msg: any) {
    try {
        const type = JSON.parse(msg.message).type
        switch (type) {
            case "https://didcomm.org/messagepickup/3.0/status":
                return JSON.parse(msg.message).body.message_count
            case "https://didcomm.org/messagepickup/3.0/delivery":
                return JSON.parse(msg.message).attachments
            default:
                break;
        }

    } catch (error: any) {
        logger("pickup - Error", error)
    }
}