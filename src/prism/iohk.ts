// import {
//     KeyDerivation,
//     MnemonicCode,
//     PrismDid,
//     CanonicalPrismDid,
//     LongFormPrismDid,
//     NodePayloadGenerator,
//     KeyGenerator, MasterKeyUsage, NodeApi, NodeExplorerApi, ProtocolVersionUpdateInfo, RevocationKeyUsage
// } from "@input-output-hk/atala-prism-sdk";
// import {getPrismDidDoc} from "./index";
// import {ECPrivateKey} from "@input-output-hk/atala-prism-sdk/dist/modules/crypto/keys";
// import {IssuingKeyUsage} from "@input-output-hk/atala-prism-sdk/dist/modules/identity";
//
// export async function demoCreatePublishDid(): Promise<string> {
//     try {
//         const mnemonicPhrase: string[] = ["roots", "id", "builds", "open", "source", "ssi", "software", "for", "grass", "roots", "identity", "efforts", "that", "matter", "and", "it", "is", "our", "mission", "to", "help", "ssi", "go", "mainstream"]
//         const passphrase: string = "rootsid123"
//         const seed = generateSeed(passphrase);
//         const did = PrismDid.fromString("did:prism:b4766dae6f496f2b1980ed5a0977e126014d2da2126f588ca4e5088cef52e989:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQLW_ckfGDXfS0iftU8_FwzWR-q2xqPwepaWPG58u1Qc_hI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhAnt_c7RF_oYNbB6ELgF7AhXiQ9s905oHkiMTnf8_FFBWEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiECHwzsoV7NrJdo5AAvzmk4WtYWN0130GruIViUSNVU4w8")
//         // NodePayloadGenerator.fromJsom(lfDid,{[passphrase],})
//         // const cDid: CanonicalPrismDid =
//         //return cDid.did.toString()
//         // return did.asCanonical().toString()
//
//         if (seed) {
//             const mKeyPair = KeyGenerator.deriveKeyFromFullPath({
//                     seed: seed,
//                     didIndex: 0, keyIndex: 0, keyType: MasterKeyUsage,
//                 }
//             )
//             const iKeyPair = KeyGenerator.deriveKeyFromFullPath({
//                     seed: seed,
//                     didIndex: 0, keyIndex: 0, keyType: IssuingKeyUsage,
//                 }
//             )
//             const rKeyPair = KeyGenerator.deriveKeyFromFullPath({
//                     seed: seed,
//                     didIndex: 0, keyIndex: 0, keyType: RevocationKeyUsage,
//                 }
//             )
//             const longDid = PrismDid.buildLongFormFromMasterPublicKey(mKeyPair.publicKey)
//             const keys: { [p: string]: ECPrivateKey } = {}
//             keys[PrismDid.MASTER_KEY_ID] = mKeyPair.privateKey;
//             keys[PrismDid.ISSUING_KEY_ID] = iKeyPair.privateKey;
//             keys[PrismDid.REVOCATION_KEY_ID] = rKeyPair.privateKey;
//             const payloadGen = NodePayloadGenerator.fromJsom(longDid, keys)
//             const didInfo = payloadGen.createDid()
//             const nodeApi = new NodeApi({
//                 protocol: "http",
//                 host: "ppp.atalaprism.io",
//                 port: 50053,
//             })
//             console.log("IOHK - didInfo",didInfo.toString())
//             const opId = await nodeApi.createDid(didInfo.payload, longDid)
//             if (opId) {
//                 return opId.hexValue()
//             }
//
//             //         val nodePayloadGenerator = NodePayloadGenerator(
//             //             prismDid as LongFormPrismDid,
//             //             mapOf(
//             //                 PrismDid.DEFAULT_MASTER_KEY_ID to masterKeyPair.privateKey,
//             //                 PrismDid.DEFAULT_ISSUING_KEY_ID to issuingKeyPair.privateKey,
//             //                 PrismDid.DEFAULT_REVOCATION_KEY_ID to revocationKeyPair.privateKey
//             //             )
//             //         )
//             //         val createDidInfo = nodePayloadGenerator.createDid()
//             //
//             //         val createDidOperationId = runBlocking {
//             //             nodeAuthApi.createDid(
//             //                 createDidInfo.payload,
//             //                 prismDid,
//             //                 PrismDid.DEFAULT_MASTER_KEY_ID
//             //             )
//             //         }
//             //
//             //         wallet.addBlockchainTxLog(
//             //             waitForSubmission(nodeAuthApi, createDidOperationId, BlockchainTxAction.PUBLISH_DID, did.alias)
//             //         )
//             //         waitUntilConfirmed(nodeAuthApi, createDidOperationId)
//             //
//             //         val response = runBlocking { nodeAuthApi.getOperationInfo(createDidOperationId) }
//             //         require(response.status == AtalaOperationStatus.CONFIRMED_AND_APPLIED) {
//             //             "expected publishing to be applied: ${response.statusDetails}"
//             //         }
//             //         did.operationHash = createDidInfo.operationHash.hexValue
//             //         return wallet
//             //     } else {
//             //         throw NoSuchElementException("DID alias '$didAlias' not found.")
//             //     }
//         }
//     } catch(error: any) {
//         console.error("Failed to generate and publish did",error,error.stack)
//     }
//     return "Failed"
// }
//
// function generateSeed(passphrase: string, mnemonicWords = KeyDerivation.randomMnemonicCode()): Int8Array|undefined {
//     try {
//         const seed = KeyDerivation.binarySeed(mnemonicWords, passphrase)
//         return seed;
//     } catch (e: any) {
//         console.error("IOHK Prism - Cannot generate seed, invalid mnemonic phrase", e)
//     }
//     return;
// }
