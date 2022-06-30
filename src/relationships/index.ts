import * as models from '../models'
import { logger } from '../logging'
import * as store from '../store'

import apLogo from '../assets/ATALAPRISM.png';
import butchLogo from '../assets/butch.png'
import catalystPng from '../assets/catalyst.png'
import darrellLogo from '../assets/darrell.png'
import estebanLogo from '../assets/esteban.png'
import iogLogo from '../assets/iog.png'
import lanceLogo from '../assets/lance.png'
import perLogo from '../assets/smallBWPerson.png';
import rodoLogo from '../assets/rodo.png'
import rwLogo from '../assets/LogoCropped.png';
import starPng from '../assets/star.png';
import tonyLogo from '../assets/tony.png';

export const prismLogo = apLogo;
export const catalystLogo = catalystPng;
export const personLogo = perLogo;
export const rootsLogo = rwLogo;
export const starLogo = starPng;

export const YOU_ALIAS = "You"
export const ROOTS_BOT = "RootsHelper";
export const PRISM_BOT = "PrismHelper";

export const LIBRARY_BOT = "did:roots:librarybot1";
const IOG_TECH = "did:roots:iogtech1";
const ROOTSID = "did:roots:rootsid";
const LANCE = "did:roots:lance";
const TONY = "did:roots:tony";
const DARRELL = "did:roots:darrell";

// roots - getRootsWallet has wallet [object Object]
// _id :   Catalyst Fund 7 demo wallet
// mnemonic :      [               faith,          battle,         float,          link,           horn,           enemy,          crawl,          sand,           village,bar,             short,          west,           mixture,                walnut,         muscle,         can,            once,           knock,          holiday,        equip,           pluck,          soon,           walnut,         snake,]
// passphrase :    rootsWalletDemo123
// dids :          [
//                 alias:  You
//                 didIdx: 0
//                 uriCanonical:   did:prism:fe2a1b24639f46bea95af5ca76e1ff4fa50b619ab09f6e34bdd55ef9dec9cd4f
//                 uriLongForm:    did:prism:fe2a1b24639f46bea95af5ca76e1ff4fa50b619ab09f6e34bdd55ef9dec9cd4f:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQK-WD0W0A8t_8wlExD6ui4xJE-DGYWUBEVCH7BSnHmo8xI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA6sQ8Gnh91_S1X-XOJ18Wsu6yLM6rixIxNC0P3O_PAzPEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiED9fHYIrtF1et9s1ifSDNknTn4dLVQ8AH1e7sd0_9Wpdg
//                 operationHash:  a28d4993f91c2f5327ae4519d1bdb40f500cd0c80aa28297ff9669e052ca32d7
//                 keyPairs:       [
//                         keyId:  master0
//                         keyTypeValue:   1
//                         didIdx: 0
//                         keyDerivation:  0
//                         keyIdx: 0
//                         privateKey:     eb9fdbed8f4165a703c03d41943e415aecea70a54db1955c1ca5106820f7a4f7
//                         publicKey:      04be583d16d00f2dffcc251310faba2e31244f831985940445421fb0529c79a8f3d70ccdd40cb8cdd70529db9b00cd7bd5ed5b927d5d4b28816c8da91814bdb070,
//                         keyId:  issuing0
//                         keyTypeValue:   2
//                         didIdx: 0
//                         keyDerivation:  1
//                         keyIdx: 0
//                         privateKey:     d46f55f008606fb2d19bf5dfdab4adca4d8c87ff4973bd1a46d3a7e569f066d7
//                         publicKey:      04ab10f069e1f75fd2d57f97389d7c5acbbac8b33aae2c48c4d0b43f73bf3c0ccfd9ecc4a061cd7147e041b2dea475e43d9bbe52a3dea23b88db5dc77ce3cc4cc3,
//                         keyId:  revocation0
//                         keyTypeValue:   5
//                         didIdx: 0
//                         keyDerivation:  4
//                         keyIdx: 0
//                         privateKey:     55f708766996ea941528d11b9f409ea165d3e3fe90d8a7a1e0d94ba4ee655c3a
//                         publicKey:      04f5f1d822bb45d5eb7db3589f4833649d39f874b550f001f57bbb1dd3ff56a5d83fde438719f5ea26ebf4fb8a6046c67f4a2e5ab4ea3a76ef51810e9fbdef5deb,],]
// issuedCredentials :     [
//                 alias:  You_rootsCredentialType_RootsHelper_1653491848488
//                 issuingDidAlias:        You
//                 claim:
//                         subjectDid:     did:prism:fe2a1b24639f46bea95af5ca76e1ff4fa50b619ab09f6e34bdd55ef9dec9cd4f:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQK-WD0W0A8t_8wlExD6ui4xJE-DGYWUBEVCH7BSnHmo8xI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA6sQ8Gnh91_S1X-XOJ18Wsu6yLM6rixIxNC0P3O_PAzPEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiED9fHYIrtF1et9s1ifSDNknTn4dLVQ8AH1e7sd0_9Wpdg
//                         content:        {"name": "Prism DID publisher","achievement": "Published a DID to Cardano - Atala Prism","date": "2022-05-25T15:17:28.512Z"}
//                 verifiedCredential:
//                         encodedSignedCredential:        eyJpZCI6ImRpZDpwcmlzbTpmZTJhMWIyNDYzOWY0NmJlYTk1YWY1Y2E3NmUxZmY0ZmE1MGI2MTlhYjA5ZjZlMzRiZGQ1NWVmOWRlYzljZDRmIiwia2V5SWQiOiJpc3N1aW5nMCIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJQcmlzbSBESUQgcHVibGlzaGVyIiwiYWNoaWV2ZW1lbnQiOiJQdWJsaXNoZWQgYSBESUQgdG8gQ2FyZGFubyAtIEF0YWxhIFByaXNtIiwiZGF0ZSI6IjIwMjItMDUtMjVUMTU6MTc6MjguNTEyWiIsImlkIjoiZGlkOnByaXNtOmZlMmExYjI0NjM5ZjQ2YmVhOTVhZjVjYTc2ZTFmZjRmYTUwYjYxOWFiMDlmNmUzNGJkZDU1ZWY5ZGVjOWNkNGY6Q3I4QkNyd0JFanNLQjIxaGMzUmxjakFRQVVvdUNnbHpaV053TWpVMmF6RVNJUUstV0QwVzBBOHRfOHdsRXhENnVpNHhKRS1ER1lXVUJFVkNIN0JTbkhtbzh4SThDZ2hwYzNOMWFXNW5NQkFDU2k0S0NYTmxZM0F5TlRack1SSWhBNnNROEduaDkxX1MxWC1YT0oxOFdzdTZ5TE02cml4SXhOQzBQM09fUEF6UEVqOEtDM0psZG05allYUnBiMjR3RUFWS0xnb0pjMlZqY0RJMU5tc3hFaUVEOWZIWUlydEYxZXQ5czFpZlNETmtuVG40ZExWUThBSDFlN3NkMF85V3BkZyJ9fQ.MEUCIF5i-BgggOHBeAOrdQXbOLr1pdHyLApfFq-zMkwgIXZaAiEArefg6MnlYCIw5r7fOnQEXhPxCPLY5WXzAbeoLh0-9G4
//                         proof:
//                                 hash:   ea6926ec25d930a8b146413bb1f2e146bc87529d4d44747f414c343f93da2226
//                                 index:  0
//                 batchId:        e013c45469adcda372c20d25a29899281b6a42c628fb1d8733ff70fb20436065
//                 credentialHash: ea6926ec25d930a8b146413bb1f2e146bc87529d4d44747f414c343f93da2226
//                 operationHash:  a28d4993f91c2f5327ae4519d1bdb40f500cd0c80aa28297ff9669e052ca32d7
//                 revoked:        false,]
// blockchainTxLogEntry :          [
//                 txId:   d503d9c320272e59992ee558a67ad571b27335faf22bb398df8cb7759794ca3a
//                 action: PUBLISH_DID
//                 url:    https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=d503d9c320272e59992ee558a67ad571b27335faf22bb398df8cb7759794ca3a
//                 description:    You,
//                 txId:   3474435f399544d752dfb040a59a55ede021c7fd880ddde9124f1c0dab2fd17b
//                 action: ISSUE_CREDENTIAL
//                 url:    https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=3474435f399544d752dfb040a59a55ede021c7fd880ddde9124f1c0dab2fd17b
//                 description:    You/You_rootsCredentialType_RootsHelper_1653491848488,]
// WalletScreen - set wallet Array []
// _id :   Catalyst Fund 7 demo wallet
// mnemonic :      [               faith,          battle,         float,          link,           horn,           enemy,          crawl,          sand,           village,bar,             short,          west,           mixture,                walnut,         muscle,         can,            once,           knock,          holiday,        equip,           pluck,          soon,           walnut,         snake,]
// passphrase :    rootsWalletDemo123
// dids :          [
//                 alias:  You
//                 didIdx: 0
//                 uriCanonical:   did:prism:fe2a1b24639f46bea95af5ca76e1ff4fa50b619ab09f6e34bdd55ef9dec9cd4f
//                 uriLongForm:    did:prism:fe2a1b24639f46bea95af5ca76e1ff4fa50b619ab09f6e34bdd55ef9dec9cd4f:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQK-WD0W0A8t_8wlExD6ui4xJE-DGYWUBEVCH7BSnHmo8xI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA6sQ8Gnh91_S1X-XOJ18Wsu6yLM6rixIxNC0P3O_PAzPEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiED9fHYIrtF1et9s1ifSDNknTn4dLVQ8AH1e7sd0_9Wpdg
//                 operationHash:  a28d4993f91c2f5327ae4519d1bdb40f500cd0c80aa28297ff9669e052ca32d7
//                 keyPairs:       [
//                         keyId:  master0
//                         keyTypeValue:   1
//                         didIdx: 0
//                         keyDerivation:  0
//                         keyIdx: 0
//                         privateKey:     eb9fdbed8f4165a703c03d41943e415aecea70a54db1955c1ca5106820f7a4f7
//                         publicKey:      04be583d16d00f2dffcc251310faba2e31244f831985940445421fb0529c79a8f3d70ccdd40cb8cdd70529db9b00cd7bd5ed5b927d5d4b28816c8da91814bdb070,
//                         keyId:  issuing0
//                         keyTypeValue:   2
//                         didIdx: 0
//                         keyDerivation:  1
//                         keyIdx: 0
//                         privateKey:     d46f55f008606fb2d19bf5dfdab4adca4d8c87ff4973bd1a46d3a7e569f066d7
//                         publicKey:      04ab10f069e1f75fd2d57f97389d7c5acbbac8b33aae2c48c4d0b43f73bf3c0ccfd9ecc4a061cd7147e041b2dea475e43d9bbe52a3dea23b88db5dc77ce3cc4cc3,
//                         keyId:  revocation0
//                         keyTypeValue:   5
//                         didIdx: 0
//                         keyDerivation:  4
//                         keyIdx: 0
//                         privateKey:     55f708766996ea941528d11b9f409ea165d3e3fe90d8a7a1e0d94ba4ee655c3a
//                         publicKey:      04f5f1d822bb45d5eb7db3589f4833649d39f874b550f001f57bbb1dd3ff56a5d83fde438719f5ea26ebf4fb8a6046c67f4a2e5ab4ea3a76ef51810e9fbdef5deb,],]
// issuedCredentials :     [
//                 alias:  You_rootsCredentialType_RootsHelper_1653491848488
//                 issuingDidAlias:        You
//                 claim:
//                         subjectDid:     did:prism:fe2a1b24639f46bea95af5ca76e1ff4fa50b619ab09f6e34bdd55ef9dec9cd4f:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQK-WD0W0A8t_8wlExD6ui4xJE-DGYWUBEVCH7BSnHmo8xI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA6sQ8Gnh91_S1X-XOJ18Wsu6yLM6rixIxNC0P3O_PAzPEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiED9fHYIrtF1et9s1ifSDNknTn4dLVQ8AH1e7sd0_9Wpdg
//                         content:        {"name": "Prism DID publisher","achievement": "Published a DID to Cardano - Atala Prism","date": "2022-05-25T15:17:28.512Z"}
//                 verifiedCredential:
//                         encodedSignedCredential:        eyJpZCI6ImRpZDpwcmlzbTpmZTJhMWIyNDYzOWY0NmJlYTk1YWY1Y2E3NmUxZmY0ZmE1MGI2MTlhYjA5ZjZlMzRiZGQ1NWVmOWRlYzljZDRmIiwia2V5SWQiOiJpc3N1aW5nMCIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJQcmlzbSBESUQgcHVibGlzaGVyIiwiYWNoaWV2ZW1lbnQiOiJQdWJsaXNoZWQgYSBESUQgdG8gQ2FyZGFubyAtIEF0YWxhIFByaXNtIiwiZGF0ZSI6IjIwMjItMDUtMjVUMTU6MTc6MjguNTEyWiIsImlkIjoiZGlkOnByaXNtOmZlMmExYjI0NjM5ZjQ2YmVhOTVhZjVjYTc2ZTFmZjRmYTUwYjYxOWFiMDlmNmUzNGJkZDU1ZWY5ZGVjOWNkNGY6Q3I4QkNyd0JFanNLQjIxaGMzUmxjakFRQVVvdUNnbHpaV053TWpVMmF6RVNJUUstV0QwVzBBOHRfOHdsRXhENnVpNHhKRS1ER1lXVUJFVkNIN0JTbkhtbzh4SThDZ2hwYzNOMWFXNW5NQkFDU2k0S0NYTmxZM0F5TlRack1SSWhBNnNROEduaDkxX1MxWC1YT0oxOFdzdTZ5TE02cml4SXhOQzBQM09fUEF6UEVqOEtDM0psZG05allYUnBiMjR3RUFWS0xnb0pjMlZqY0RJMU5tc3hFaUVEOWZIWUlydEYxZXQ5czFpZlNETmtuVG40ZExWUThBSDFlN3NkMF85V3BkZyJ9fQ.MEUCIF5i-BgggOHBeAOrdQXbOLr1pdHyLApfFq-zMkwgIXZaAiEArefg6MnlYCIw5r7fOnQEXhPxCPLY5WXzAbeoLh0-9G4
//                         proof:
//                                 hash:   ea6926ec25d930a8b146413bb1f2e146bc87529d4d44747f414c343f93da2226
//                                 index:  0
//                 batchId:        e013c45469adcda372c20d25a29899281b6a42c628fb1d8733ff70fb20436065
//                 credentialHash: ea6926ec25d930a8b146413bb1f2e146bc87529d4d44747f414c343f93da2226
//                 operationHash:  a28d4993f91c2f5327ae4519d1bdb40f500cd0c80aa28297ff9669e052ca32d7
//                 revoked:        false,]
// blockchainTxLogEntry :          [
//                 txId:   d503d9c320272e59992ee558a67ad571b27335faf22bb398df8cb7759794ca3a
//                 action: PUBLISH_DID
//                 url:    https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=d503d9c320272e59992ee558a67ad571b27335faf22bb398df8cb7759794ca3a
//                 description:    You,
//                 txId:   3474435f399544d752dfb040a59a55ede021c7fd880ddde9124f1c0dab2fd17b
//                 action: ISSUE_CREDENTIAL
//                 url:    https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=3474435f399544d752dfb040a59a55ede021c7fd880ddde9124f1c0dab2fd17b
//                 description:    You/You_rootsCredentialType_RootsHelper_1653491848488,]
const BUTCH = "did:prism:fe2a1b24639f46bea95af5ca76e1ff4fa50b619ab09f6e34bdd55ef9dec9cd4f:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQK-WD0W0A8t_8wlExD6ui4xJE-DGYWUBEVCH7BSnHmo8xI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA6sQ8Gnh91_S1X-XOJ18Wsu6yLM6rixIxNC0P3O_PAzPEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiED9fHYIrtF1et9s1ifSDNknTn4dLVQ8AH1e7sd0_9Wpdg";

// AuthStack - RESTORE_TOKEN w/ token Object {
//   "_id": "Catalyst Fund 7 demo wallet",
//   "blockchainTxLogEntry": Array [
//     Object {
//       "action": "PUBLISH_DID",
//       "description": "You",
//       "txId": "de3382dd0ed3564b8042681e2e0479ce963a0520815c7ca6b0520c15479b39d0",
//       "url": "https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=de3382dd0ed3564b8042681e2e0479ce963a0520815c7ca6b0520c15479b39d0",
//     },
//     Object {
//       "action": "ISSUE_CREDENTIAL",
//       "description": "You/You_rootsCredentialType_RootsHelper_1653488792357",
//       "txId": "e5141c05ce3bbc17a6d1b244eb2b355c16deae00e2934f2ffe3a681379dc52d6",
//       "url": "https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=e5141c05ce3bbc17a6d1b244eb2b355c16deae00e2934f2ffe3a681379dc52d6",
//     },
//   ],
//   "dids": Array [
//     Object {
//       "alias": "You",
//       "didIdx": 0,
//       "keyPairs": Array [
//         Object {
//           "didIdx": 0,
//           "keyDerivation": 0,
//           "keyId": "master0",
//           "keyIdx": 0,
//           "keyTypeValue": 1,
//           "privateKey": "3080afdb855bd8ca72db61be93df8995a7d8e3ce071c4dfe2f7c48cfb7bd48f1",
//           "publicKey": "047f130d08829ca1a0b78fd4c384504828fe1358da0af046454c47cd5e37ebc9a019b93b9a5b958bb72957ed9d4673d4de8090354b15fdaa1398a05e3751b736c5",
//         },
//         Object {
//           "didIdx": 0,
//           "keyDerivation": 1,
//           "keyId": "issuing0",
//           "keyIdx": 0,
//           "keyTypeValue": 2,
//           "privateKey": "f1a4a0277a2e1aa11a18c7cb73aea8b3c92926266bfb2d53ecaa86523d7a40ed",
//           "publicKey": "049e3a9817cf4cf2edddccef63a27148b4e4d2967b351db7da157b23ef3256eb455ae4df6d081a9172879298464d835cd05db1d0d6f1eaa51a7cab18ee01e4a397",
//         },
//         Object {
//           "didIdx": 0,
//           "keyDerivation": 4,
//           "keyId": "revocation0",
//           "keyIdx": 0,
//           "keyTypeValue": 5,
//           "privateKey": "9bae4e8f5286e02a5a53f94461744102c0b7d9612790ef10f1b43475f4532b1d",
//           "publicKey": "045deddbb46a2d7fa7d7ad051faf57cc5e1691b733eb431efabfff9de07edde2fe14e40f5751f140b37e2634aeb50ab31c2d66d4413ccca8ac4d14a68805ef190b",
//         },
//       ],
//       "operationHash": "10a17241037e5e828d6978e2935058aa57da29cd0f6ce9dda354824a5f60ea07",
//       "uriCanonical": "did:prism:95f08753750ce5246001f40046a55d2a0bba299f1de7b385035387fdc2043b0b",
//       "uriLongForm": "did:prism:95f08753750ce5246001f40046a55d2a0bba299f1de7b385035387fdc2043b0b:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQN_Ew0IgpyhoLeP1MOEUEgo_hNY2grwRkVMR81eN-vJoBI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA546mBfPTPLt3czvY6JxSLTk0pZ7NR232hV7I-8yVutFEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiEDXe3btGotf6fXrQUfr1fMXhaRtzPrQx76v_-d4H7d4v4",
//     },
//   ],
//   "issuedCredentials": Array [
//     Object {
//       "alias": "You_rootsCredentialType_RootsHelper_1653488792357",
//       "batchId": "cb237d52732fbff07e38fc2a354d002c2d01a4ddc733d9ea63905d5c24fae4b9",
//       "claim": Object {
//         "content": "{\"name\": \"Prism DID publisher\",\"achievement\": \"Published a DID to Cardano - Atala Prism\",\"date\": \"2022-05-25T14:26:32.389Z\"}",
//         "subjectDid": "did:prism:95f08753750ce5246001f40046a55d2a0bba299f1de7b385035387fdc2043b0b:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQN_Ew0IgpyhoLeP1MOEUEgo_hNY2grwRkVMR81eN-vJoBI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA546mBfPTPLt3czvY6JxSLTk0pZ7NR232hV7I-8yVutFEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiEDXe3btGotf6fXrQUfr1fMXhaRtzPrQx76v_-d4H7d4v4",
//       },
//       "credentialHash": "85d7044d94912bea96097a4a16a8081bddc9b9cbea4e01247d255f8f7bc24f66",
//       "issuingDidAlias": "You",
//       "operationHash": "10a17241037e5e828d6978e2935058aa57da29cd0f6ce9dda354824a5f60ea07",
//       "revoked": false,
//       "verifiedCredential": Object {
//         "encodedSignedCredential": "eyJpZCI6ImRpZDpwcmlzbTo5NWYwODc1Mzc1MGNlNTI0NjAwMWY0MDA0NmE1NWQyYTBiYmEyOTlmMWRlN2IzODUwMzUzODdmZGMyMDQzYjBiIiwia2V5SWQiOiJpc3N1aW5nMCIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJQcmlzbSBESUQgcHVibGlzaGVyIiwiYWNoaWV2ZW1lbnQiOiJQdWJsaXNoZWQgYSBESUQgdG8gQ2FyZGFubyAtIEF0YWxhIFByaXNtIiwiZGF0ZSI6IjIwMjItMDUtMjVUMTQ6MjY6MzIuMzg5WiIsImlkIjoiZGlkOnByaXNtOjk1ZjA4NzUzNzUwY2U1MjQ2MDAxZjQwMDQ2YTU1ZDJhMGJiYTI5OWYxZGU3YjM4NTAzNTM4N2ZkYzIwNDNiMGI6Q3I4QkNyd0JFanNLQjIxaGMzUmxjakFRQVVvdUNnbHpaV053TWpVMmF6RVNJUU5fRXcwSWdweWhvTGVQMU1PRVVFZ29faE5ZMmdyd1JrVk1SODFlTi12Sm9CSThDZ2hwYzNOMWFXNW5NQkFDU2k0S0NYTmxZM0F5TlRack1SSWhBNTQ2bUJmUFRQTHQzY3p2WTZKeFNMVGswcFo3TlIyMzJoVjdJLTh5VnV0RkVqOEtDM0psZG05allYUnBiMjR3RUFWS0xnb0pjMlZqY0RJMU5tc3hFaUVEWGUzYnRHb3RmNmZYclFVZnIxZk1YaGFSdHpQclF4NzZ2Xy1kNEg3ZDR2NCJ9fQ.MEUCICkoQBwlZOQhjq18bNFps8r2YIS4BfV3axxaU-XOdNPbAiEAtMr3n5sAsDNun_6kGZV8EoJtj8fiAziKUNqH3rmRVdg",
//         "proof": Object {
//           "hash": "85d7044d94912bea96097a4a16a8081bddc9b9cbea4e01247d255f8f7bc24f66",
//           "index": 0,
//         },
//       },
//     },
//   ],
//   "mnemonic": Array [
//     "venture",
//     "shoot",
//     "crime",
//     "core",
//     "casual",
//     "flash",
//     "fossil",
//     "custom",
//     "wrestle",
//     "author",
//     "visit",
//     "clinic",
//     "disagree",
//     "unhappy",
//     "patrol",
//     "square",
//     "knife",
//     "boy",
//     "tomato",
//     "always",
//     "build",
//     "apple",
//     "glow",
//     "vanish",
//   ],
//   "passphrase": "rootsWalletDemo123",
// }
const ESTEBAN = "did:prism:95f08753750ce5246001f40046a55d2a0bba299f1de7b385035387fdc2043b0b:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQN_Ew0IgpyhoLeP1MOEUEgo_hNY2grwRkVMR81eN-vJoBI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA546mBfPTPLt3czvY6JxSLTk0pZ7NR232hV7I-8yVutFEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiEDXe3btGotf6fXrQUfr1fMXhaRtzPrQx76v_-d4H7d4v4";

// WalletScreen - set wallet Array []
// _id :   Catalyst Fund 7 demo wallet
// mnemonic :      [               quarter,                garage,         east,           inch,           magic,          wear,           envelope,               broccoli,frost,          man,            shell,          awful,          predict,                daring,         prosper,                spend,          settle,         slow,   index,           retire,         absorb,         episode,                endless,                taxi,]
// passphrase :    rootsWalletDemo123
// dids :          [
//                 alias:  You
//                 didIdx: 0
//                 uriCanonical:   did:prism:0206326ed47eda4bd9917886cfad6bdaf9d6420af80ecc23af5791bfc7bcc05c
//                 uriLongForm:    did:prism:0206326ed47eda4bd9917886cfad6bdaf9d6420af80ecc23af5791bfc7bcc05c:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQN6DKpb9OFDasJVeXCPBU34cF4E6FGaljA3VBlA7EJqjhI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA1NKHFw8xk2ptXovPwKGzMokfddV9YRvs2X14P66HrzsEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiECH-dwm0ZXDHz6xSDKAQDQFl3hQT0pcyqdE0xKJcm7nrs
//                 operationHash:  b9b229aa6450791ef3582d035998c492c9b47538eeb651aab786d7655419d8a2
//                 keyPairs:       [
//                         keyId:  master0
//                         keyTypeValue:   1
//                         didIdx: 0
//                         keyDerivation:  0
//                         keyIdx: 0
//                         privateKey:     7936aea5bc88e21905619e7893708346a176670d16cf08f3fe9778422bfa69bb
//                         publicKey:      047a0caa5bf4e1436ac25579708f054df8705e04e8519a963037541940ec426a8e72518e04f341595b3f1b738d5d7d619a8e5a21ba4c48f179ed368ff2910bc311,
//                         keyId:  issuing0
//                         keyTypeValue:   2
//                         didIdx: 0
//                         keyDerivation:  1
//                         keyIdx: 0
//                         privateKey:     b382fffa371e7bdba5a491b28fe8b9cca758c4516a44391dbd72ea42f516a249
//                         publicKey:      04534a1c5c3cc64da9b57a2f3f0286ccca247dd755f5846fb365f5e0feba1ebcec15257dbb25776a2b9b0dbe52a75a88780fd80f9bb301715f06cd63bf7ddc3fdd,
//                         keyId:  revocation0
//                         keyTypeValue:   5
//                         didIdx: 0
//                         keyDerivation:  4
//                         keyIdx: 0
//                         privateKey:     62b1e32a4e9c7845950b5f3ba62a0b28d69907876863aa664acc2c50eca69ec0
//                         publicKey:      041fe7709b46570c7cfac520ca0100d0165de1413d29732a9d134c4a25c9bb9ebb6c3b20e5c6fdecc894f05b0fa9e47330a04e0710151e7d1cb03b2294a4b99712,],]
// issuedCredentials :     [
//                 alias:  You_rootsCredentialType_RootsHelper_1653490433925
//                 issuingDidAlias:        You
//                 claim:
//                         subjectDid:     did:prism:0206326ed47eda4bd9917886cfad6bdaf9d6420af80ecc23af5791bfc7bcc05c:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQN6DKpb9OFDasJVeXCPBU34cF4E6FGaljA3VBlA7EJqjhI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA1NKHFw8xk2ptXovPwKGzMokfddV9YRvs2X14P66HrzsEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiECH-dwm0ZXDHz6xSDKAQDQFl3hQT0pcyqdE0xKJcm7nrs
//                         content:        {"name": "Prism DID publisher","achievement": "Published a DID to Cardano - Atala Prism","date": "2022-05-25T14:53:53.955Z"}
//                 verifiedCredential:
//                         encodedSignedCredential:        eyJpZCI6ImRpZDpwcmlzbTowMjA2MzI2ZWQ0N2VkYTRiZDk5MTc4ODZjZmFkNmJkYWY5ZDY0MjBhZjgwZWNjMjNhZjU3OTFiZmM3YmNjMDVjIiwia2V5SWQiOiJpc3N1aW5nMCIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJQcmlzbSBESUQgcHVibGlzaGVyIiwiYWNoaWV2ZW1lbnQiOiJQdWJsaXNoZWQgYSBESUQgdG8gQ2FyZGFubyAtIEF0YWxhIFByaXNtIiwiZGF0ZSI6IjIwMjItMDUtMjVUMTQ6NTM6NTMuOTU1WiIsImlkIjoiZGlkOnByaXNtOjAyMDYzMjZlZDQ3ZWRhNGJkOTkxNzg4NmNmYWQ2YmRhZjlkNjQyMGFmODBlY2MyM2FmNTc5MWJmYzdiY2MwNWM6Q3I4QkNyd0JFanNLQjIxaGMzUmxjakFRQVVvdUNnbHpaV053TWpVMmF6RVNJUU42REtwYjlPRkRhc0pWZVhDUEJVMzRjRjRFNkZHYWxqQTNWQmxBN0VKcWpoSThDZ2hwYzNOMWFXNW5NQkFDU2k0S0NYTmxZM0F5TlRack1SSWhBMU5LSEZ3OHhrMnB0WG92UHdLR3pNb2tmZGRWOVlSdnMyWDE0UDY2SHJ6c0VqOEtDM0psZG05allYUnBiMjR3RUFWS0xnb0pjMlZqY0RJMU5tc3hFaUVDSC1kd20wWlhESHo2eFNES0FRRFFGbDNoUVQwcGN5cWRFMHhLSmNtN25ycyJ9fQ.MEUCIQDV7wkrWqyhUWlbgiL7OcTnSy9hT8Ci9iHlXal4sFdeggIgVAZKUSjms93nGuMp8tU0luJW4_lcP8dS7ipVyoA8WX4
//                         proof:
//                                 hash:   9a0e1b27601fad964dd18a7e77929bdc5d51018edfd01d45dfbe0f0d1cce8461
//                                 index:  0
//                 batchId:        23363603b1ac427023f97a7064c1bb6be856b016433754c68677b1deae0fcb30
//                 credentialHash: 9a0e1b27601fad964dd18a7e77929bdc5d51018edfd01d45dfbe0f0d1cce8461
//                 operationHash:  b9b229aa6450791ef3582d035998c492c9b47538eeb651aab786d7655419d8a2
//                 revoked:        false,]
// blockchainTxLogEntry :          [
//                 txId:   89eee1afa76dc5ee19df2d17f57eb7f202ff98e7b0d96680ed9fa344bbad20b9
//                 action: PUBLISH_DID
//                 url:    https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=89eee1afa76dc5ee19df2d17f57eb7f202ff98e7b0d96680ed9fa344bbad20b9
//                 description:    You,
//                 txId:   f9def1429df20a3ac68e979560a3c58e78ecf3b0de98e33785ba5f13f7f2d45d
//                 action: ISSUE_CREDENTIAL
//                 url:    https://explorer.cardano-testnet.iohkdev.io/en/transaction?id=f9def1429df20a3ac68e979560a3c58e78ecf3b0de98e33785ba5f13f7f2d45d
//                 description:    You/You_rootsCredentialType_RootsHelper_1653490433925,]
const RODO = "did:prism:0206326ed47eda4bd9917886cfad6bdaf9d6420af80ecc23af5791bfc7bcc05c:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQN6DKpb9OFDasJVeXCPBU34cF4E6FGaljA3VBlA7EJqjhI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhA1NKHFw8xk2ptXovPwKGzMokfddV9YRvs2X14P66HrzsEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiECH-dwm0ZXDHz6xSDKAQDQFl3hQT0pcyqdE0xKJcm7nrs";

export const allRelsRegex = new RegExp(models.getStorageKey("",models.MODEL_TYPE_REL)+'*')

export const refreshTriggers = []

let currentDemoRel = -1
const demoRelOrder = [ESTEBAN,RODO,LANCE,BUTCH,DARRELL,TONY,ROOTSID,IOG_TECH,LIBRARY_BOT]
const demoRels = {}
demoRels[LIBRARY_BOT] = [LIBRARY_BOT,"Library",personLogo,LIBRARY_BOT]
demoRels[IOG_TECH] = [IOG_TECH, "IOG Tech Community",iogLogo,IOG_TECH]
demoRels[ROOTSID] = [ROOTSID, "RootsID",rootsLogo,ROOTSID]
demoRels[LANCE] = [LANCE, "MeGrimLance",lanceLogo,LANCE]
demoRels[TONY] = [TONY,"Tony.Rose",tonyLogo,TONY]
demoRels[DARRELL] = [DARRELL,"Darrell O'Donnell",darrellLogo,DARRELL]
demoRels[BUTCH] = [BUTCH,"Butch Clark",butchLogo,BUTCH]
demoRels[ESTEBAN] = [ESTEBAN,"Esteban Garcia",estebanLogo,ESTEBAN]
demoRels[RODO] = [RODO,"Rodolfo Miranda",rodoLogo,RODO]

export function addRefreshTrigger(trigger) {
    logger("rels - adding refresh trigger")
    refreshTriggers.push(trigger)
}

//TODO unify aliases and storageKeys?
export async function createRelItem(alias: string, name: string, pic=personLogo, did?: string) {
    try {
        logger("create rel item",alias,name,pic);
        if(getRelItem(alias)) {
            logger("rels - rel already exists",alias)
            return true;
        } else {
            logger("rels - rel did not exist",alias)
            const relItem = models.createRel(alias, name, pic,did)
            const relItemJson = JSON.stringify(relItem)
            logger("rels - generated rel",relItemJson)
            const result = await store.saveItem(models.getStorageKey(alias, models.MODEL_TYPE_REL), relItemJson)
            logger("rels - created rel",alias,"?",result)
            hasNewRels()
            return result;
        }
    } catch(error) {
        console.error("Failed to create rel",alias,error,error.stack)
        return false
    }
}

export function hasNewRels() {
    logger("rels - triggering rel refresh",refreshTriggers.length)
   refreshTriggers.forEach(trigger=>trigger())
}

export function getRelationships() {
    logger("rels - getting rel items")
    const relItemJsonArray = store.getItems(allRelsRegex)
    logger("rels - got rel items",String(relItemJsonArray))
    const rels = relItemJsonArray.map(relItemJson => JSON.parse(relItemJson))
    return rels;
}

export function getRelItem(relId) {
    logger("rels - Getting rel",relId)
    if(relId) {
        const relItemJson = store.getItem(models.getStorageKey(relId,models.MODEL_TYPE_REL));
        logger("rels - Got rel json",relItemJson)
        if(relItemJson) {
            const relItem = JSON.parse(relItemJson)
            logger("rels - rel w/keys",Object.keys(relItem))
            return relItem
        } else {
            logger("rels - rel not found",relId)
            return relItemJson
        }
    } else {
        logger("rels - can't get rel for undefined relId",relId)
    }
}

export function isShareable(rel: object) {
    if(!rel.id && rel.did) {
        logger("rels - rel is shareable",rel.did)
        return true
    } else {
        logger("rels - rel NOT shareable",rel.id,rel.did)
    }
}

export function getShareableRelByAlias(alias: string) {
    logger("roots - getting shareable rel by alias",alias)
    const rel = getRelItem(alias)
    const shareable = {
        displayName: rel.displayName,
        displayPictureUrl: rel.displayPictureUrl,
        did: rel.did,
    }
    return shareable
}

export function showRel(navigation,rel) {
    console.log("rel - show rel",rel)
    navigation.navigate('Relationship Details',{rel: getShareableRelByAlias(rel)})
}

// export async function initDemoRels() {
//     logger("rels - init demo rels")
//     await createRelItem(LIBRARY_BOT,"Library",personLogo,LIBRARY_BOT)
//     await createRelItem(IOG_TECH, "IOG Tech Community",iogLogo,IOG_TECH);
//     await createRelItem(ROOTSID, "RootsID",rootsLogo,ROOTSID);
//     await createRelItem(LANCE, "MeGrimLance",lanceLogo,LANCE);
//     await createRelItem(TONY,"Tony.Rose",tonyLogo,TONY)
//     await createRelItem(DARRELL,"Darrell O'Donnell",darrellLogo,DARRELL)
//     await createRelItem(BUTCH,"Butch Clark",butchLogo,BUTCH)
//     await createRelItem(ESTEBAN,"Esteban Garcia",estebanLogo,ESTEBAN)
//     await createRelItem(RODO,"Rodolfo Miranda",rodoLogo,RODO)
// }

export function getDemoRel() {
    if(currentDemoRel >= (demoRelOrder.length-1)) {
        return getFakeRelItem()
    } else {
        currentDemoRel++
        const dRel = demoRelOrder[currentDemoRel]
        console.log("rels - get demo rel data for",dRel)
        const demoRel = demoRels[dRel]
        console.log("rels - got demo rel args",demoRel)
        const result = models.createRel(...demoRel)
        console.log("rels - got demo rel",result)
        return result
    }
}

function getFakeRelItem() {
   return {  dataType: "rel",
        displayPictureUrl: personLogo,
        displayName: "fakePerson"+Date.now(),
        did: "did:roots:fakedid"+Date.now(),
    }
}