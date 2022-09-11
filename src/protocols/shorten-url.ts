import {logger} from "../logging";
import { sendMessage, pack } from "../didcommv2";


export async function shortenURLRequest(from: string, to: string, url: string, validityInSecond: number) {

    try {
        const msgPacked = await pack(
            {
                url: url,
                requested_validity_seconds: parseInt(validityInSecond.toString()),
                goal_code: "shorten.oobv2"
            }, 
            from, 
            to, 
            "https://didcomm.org/shorten-url/1.0/request-shortened-url", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendMessage(msgPacked, to)
    } catch (error: any) {
        logger("shorten-url - Error", error)
    }
}

export async function invalidateShortURL(from: string, to: string, url: string) {

    try {
        const msgPacked = await pack(
            {
                shortened_url: url
            }, 
            from, 
            to, 
            "https://didcomm.org/shorten-url/1.0/invalidate-shortened-url", 
            [{return_route: "all"}],
            null,
            true,
            null
          )
        return await sendMessage(msgPacked, to)
    } catch (error: any) {
        logger("shorten-url - Error", error)
    }
}

export async function receiveShortenedURL(msg: any) {
    try {
        const type = JSON.parse(msg.message).type
        switch (type) {
            case "https://didcomm.org/shorten-url/1.0/shortened-url":
                return JSON.parse(msg.message).body.shortened_url
            default:
                break;
        }

    } catch (error: any) {
        logger("pickup - Error", error)
    }
}


