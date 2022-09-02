import {io} from "@input-output-hk/atala-prism-sdk";
//import createExperimentalDidFromMnemonic = io.iohk.atala.prism.api.createExperimentalDidFromMnemonic;
import MnemonicCode = io.iohk.atala.prism.crypto.derivation.MnemonicCode;

export function demoCreatePublishDid(): string {
    const mnemonicPhrase: string[] = ["roots","id","builds","open","source","ssi","software","for","grass","roots","identity","efforts","that","matter","and","it","is","our","mission","to","help","ssi","go","mainstream"]
    let mnemonicCode: MnemonicCode;
    const passphrase = "rootsid123"
    return passphrase
    // const context = createExperimentalDidFromMnemonic(mnemonicCode,0,passphrase)
    // return context.unpublishedDid.toString()
}
