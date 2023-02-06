import {NativeModules} from "react-native";
import {logger} from "../logging";

export const PrismModule = NativeModules.PrismModule;

export async function getPrismDidDoc(did: string) {
    logger("getting DID doc", did)
    try {
        //return await PrismModule.getDIDDocument(did);
        return {}
    } catch (error: any) {
        console.error("roots - Error getting DID doc for", did,error, error.stack)
    }
    return;
}
