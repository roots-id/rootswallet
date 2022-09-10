import {logger} from "../logging";
import { sendMessage, pack } from "../didcommv2";


export async function shortenURLRequest(from: string, to: string, credential: any) {

    try {
        const msgPacked = await pack(
            {
                "goal_code": "issue-credential"
            }, 
            from, 
            to, 
            "https://didcomm.org/issue-credential/3.0/request-credential", 
            [{return_route: "all"}],
            null,
            true,
            [credential]
          )
        return await sendMessage(msgPacked, to)
    } catch (error: any) {
        logger("issue-credential - Error", error)
    }
}


