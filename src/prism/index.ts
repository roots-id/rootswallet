import { NativeModules } from "react-native";
import {logger} from "../logging";

export const PrismModule = NativeModules.PrismModule;

export async function getPrismDidDoc(did: string) {
    logger("getting DID doc", did)
    try {
        const didDocJson = await PrismModule.getDidDocument(did);
        return didDocJson;
    } catch (error) {
        console.error("roots - Error getting DID doc for", did,error, error.stack)
    }
    return;
}