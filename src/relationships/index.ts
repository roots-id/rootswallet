import * as models from '../models'
import {logger} from '../logging'
import {contact, contactShareable} from "../models";
import {getPrismDidDoc} from "../prism";
import * as store from '../store'


export const butchLogo = require('../assets/butch.png');
export const darrellLogo = require('../assets/darrell.png');
export const estebanLogo = require('../assets/esteban.png');
export const iogLogo = require('../assets/iog.png');
export const lanceLogo = require('../assets/lance.png');
export const rodoLogo = require('../assets/rodo.png');
export const tonyLogo = require('../assets/tony.png');

export const prismLogo = require('../assets/ATALAPRISM.png');
export const catalystLogo = require('../assets/catalyst.png');
export const personLogo = require('../assets/smallBWPerson.png');
export const rootsLogo = require('../assets/LogoCropped.png');
export const brandLogo = require('../assets/LogoOnly1024.png');

export const YOU_ALIAS = "You"
export const ROOTS_BOT = "RootsHelper";
export const PRISM_BOT = "PrismHelper";

export const LIBRARY_BOT = "did:roots:librarybot1";
const IOG_TECH = "\"did:prism:b4766dae6f496f2b1980ed5a0977e126014d2da2126f588ca4e5088cef52e989:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQLW_ckfGDXfS0iftU8_FwzWR-q2xqPwepaWPG58u1Qc_hI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhAnt_c7RF_oYNbB6ELgF7AhXiQ9s905oHkiMTnf8_FFBWEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiECHwzsoV7NrJdo5AAvzmk4WtYWN0130GruIViUSNVU4w8";
const ROOTSID = "did:prism:96a6c1857f3dff794375affb0bd44c6168f416d9344777231c61b18426b3b852:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQI9he3p0tbnoHSQbpbMzgtqtvEy26DjAjVyJXH47_HlsxI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhArSwvGsU30Ehl3y4D0rq2Qk3VcbQuj_9R8NplqWQCz0ZEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiED1RGpK9yJZWYTIxS28ResIqzyem9B6qFfK4wo-_heExk";
//password is 'a'
const LANCE = "did:prism:c3830f7f8441ed7dfe0cc26c38be2da21c43cf7fa5e78f498ebfb4d5028c776b:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQMdkSItMex2CvyD6p4idSylxEYS1l5CEIowmo0GjnTeYBI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhAqRnmPJdAwnQrBuBR8ewEN84D9mdNvLFOJbFH8gPNlYKEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiECeT-pVl-LayXPVemYBoIAATUJf00Q2exbtJIlmEAdXbQ";
const TONY = "did:prism:4bf45ec2f222b5e1e6e2c90310742650623ceaf5102088f6181904907d8cbe78:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQPia7nkvQ_W0AS0CjsytT7edGdexYOh69g2SId9Yo1EQBI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhAloWhDDh4LOINfHsTaUI4rsByRrv8mkTl4zrxOD2VmEiEj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiEDz4g5LHC_9Dtwvc1WiUl1qK0nhUVfz6pVx-ObuFnhIzo";
const DARRELL = "did:prism:4ae7d4dbd6da5f84447295dd8a13b3a5d492a39c8b8ac789e7f448def37abc6f:Cr8BCrwBEjsKB21hc3RlcjAQAUouCglzZWNwMjU2azESIQN9Sdkyn-sKjLPNSsDBQlFUTiKI5HZcA5shofvNW88ZSBI8Cghpc3N1aW5nMBACSi4KCXNlY3AyNTZrMRIhAzyaj2ahjGAx3jRtDggBgDVq_TSkz6wYg2Qgtp1AVbhREj8KC3Jldm9jYXRpb24wEAVKLgoJc2VjcDI1NmsxEiECxG5IzkkIhF5d7tCB1hwza_VpXI58rNklVe3f_iskw-A";

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

export const allRelsRegex = new RegExp(models.getStorageKey("",models.ModelType.CONTACT)+'*')

export const refreshTriggers: {(): void}[] = []

//DEMO stuff
let currentDemoRel = -1
const demoRelOrder = [ESTEBAN,RODO,LANCE,BUTCH,DARRELL,TONY,ROOTSID,IOG_TECH,LIBRARY_BOT]
const demoRels: {[did: string]: models.contact} = {}
demoRels[LIBRARY_BOT] = createRel(LIBRARY_BOT,"Library",personLogo,LIBRARY_BOT);
demoRels[IOG_TECH] = createRel(IOG_TECH, "IOG Tech Community",iogLogo,IOG_TECH);
demoRels[ROOTSID] = createRel(ROOTSID, "RootsID",rootsLogo,ROOTSID);
demoRels[LANCE] = createRel(LANCE, "MeGrimLance",lanceLogo,LANCE);
demoRels[TONY] = createRel(TONY,"Tony.Rose",tonyLogo,TONY);
demoRels[DARRELL] = createRel(DARRELL,"Darrell O'Donnell",darrellLogo,DARRELL);
demoRels[BUTCH] = createRel(BUTCH,"Butch Clark",butchLogo,BUTCH);
demoRels[ESTEBAN] = createRel(ESTEBAN,"Esteban Garcia",estebanLogo,ESTEBAN);
demoRels[RODO] = createRel(RODO,"Rodolfo Miranda",rodoLogo,RODO);

export async function addDidDoc(contact: models.contact) {
    logger("roots - getting did doc for contact",contact.did)
    const didDocJson = await getPrismDidDoc(contact.did)
    if(didDocJson) {
        const saveMe = getContactByDid(contact.did)
        if(saveMe) {
            const didDoc = JSON.parse(didDocJson)
            saveMe.didDoc = didDoc
            contact.didDoc = didDoc
            await updateContact(saveMe)
        }
    }
    return contact;
}

//triggers for updating Contacts
export function addRefreshTrigger(trigger: ()=>{}) {
    logger("rels - adding refresh trigger")
    refreshTriggers.push(trigger)
}

export function asContactShareable(contact: models.contact): contactShareable {
    const shareable = {
        displayName: contact.displayName,
        displayPictureUrl: contact.displayPictureUrl,
        did: contact.did,
    }
    console.log("rels - shareable contact", JSON.stringify(shareable))
    return shareable
}

export function createRel(relAlias: string, relName: string, relPicUrl: string, did: string) :contact{
    const rel = {
        id: relAlias,
        displayName: relName,
        displayPictureUrl: relPicUrl,
        did: did,
    }
    logger("models - create rel model w/keys",Object.keys(rel))
    return rel;
}

//TODO unify aliases and storageKeys?
export async function createRelItem(alias: string, name: string, pic=personLogo, did: string) {
    try {
        logger("rels - create rel item",alias,name,pic);
        if(getContactByAlias(alias)) {
            logger("rels - rel already exists",alias)
            return true;
        } else {
            logger("rels - rel did not exist",alias)
            const relItem = createRel(alias, name, pic,did)
            const result = updateContact(relItem)
            logger("rels - created rel",alias,"?",result)
            return result;
        }
    } catch(error: any) {
        console.error("Failed to create rel",alias,error,error.stack)
        return false
    }
}

export async function hasNewRels() {
    logger("rels - triggering rel refresh",refreshTriggers.length)
    refreshTriggers.forEach(trigger=>trigger())
}

export function getRelationships() {
    logger("rels - getting rel items")
    const relItemJsonArray = store.getItems(allRelsRegex)
    logger("rels - got rel items",String(relItemJsonArray))
    const rels = relItemJsonArray.map(relItemJson => JSON.parse(relItemJson))
    logger("rels - got # of rels",rels.length)
    return rels;
}

export function getContactByAlias(relId: string): models.contact|undefined {
    logger("rels - Getting rel",relId)
    if(relId) {
        const relItemJson = store.getItem(models.getStorageKey(relId,models.ModelType.CONTACT));
        logger("rels - Got rel json",relItemJson)
        if(relItemJson) {
            const relItem = JSON.parse(relItemJson)
            logger("rels - rel w/keys",Object.keys(relItem))
            return relItem
        } else {
            logger("rels - rel not found",relId)
        }
    } else {
        logger("rels - can't get rel for undefined relId",relId)
    }
    return;
}

export function getContactByDid(did: string): models.contact|undefined {
    logger("rels - Getting contact by DID",did)
    if(did) {
        const contact = getRelationships().find(con => con.did === did);
        logger("rels - Got contact",JSON.stringify(contact))
        return contact
    } else {
        logger("rels - can't get contact for undefined did",did)
    }
    return;
}

export function isShareable(rel: models.contact) {
    if(!rel.id && rel.did) {
        logger("rels - rel is shareable",rel.did)
        return true
    } else {
        logger("rels - rel NOT shareable",rel.id,rel.did)
    }
}

export function getShareableRelByAlias(alias: string): models.contactShareable|undefined {
    logger("roots - getting shareable rel by alias",alias)
    const rel = getContactByAlias(alias)
    if(rel && rel.did) {
        return asContactShareable(rel)
    }
}

export async function updateContact(contact: models.contact): Promise<boolean> {
    const contactJson = JSON.stringify(contact)
    logger("rels - updating contact",contactJson)
    const result = await store.updateItem(models.getStorageKey(contact.id, models.ModelType.CONTACT), contactJson)
    return result;
}

export function showRel(navigation: any, rel: contactShareable) {
    console.log("rel - show rel",rel)
    navigation.navigate('Relationship Details',{rel: rel})
}

export function getDemoRel(): models.contactShareable {
    if(currentDemoRel >= (demoRelOrder.length-1)) {
        return getFakeRelItem()
    } else {
        currentDemoRel++
        return asContactShareable(demoRels[demoRelOrder[currentDemoRel]])
    }
}

function getFakeRelItem(): models.contactShareable {
   return {
        displayPictureUrl: personLogo,
        displayName: "fakePerson"+Date.now(),
        did: "did:roots:fakedid"+Date.now(),
    }
}
