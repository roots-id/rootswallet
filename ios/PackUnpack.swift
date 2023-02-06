//
//  pack-unpack.swift
//  rootswallet
//
//  Created by Rodolfo Miranda on 1/28/23.
//


import DidcommSDK
import Foundation

@objc(PackUnpack)
class PackUnpack: NSObject {

  @objc(packEncrypted:id:thid:to:from:messageType:customHeaders:privateKey:publicKey:signFrom:protectSender:attachments:withResolver:withRejecter:)
  func packEncrypted(body: NSString,
                     id: NSString,
                     thid: NSString,
                     to: NSString,
                     from: NSString? = nil,
                     messageType: NSString,
                     customHeaders: NSDictionary,
                     privateKey: NSString,
                     publicKey: NSString,
                     signFrom: Bool,
                     protectSender: Bool,
                     attachments: NSArray,
                     resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock
  ) {
    let didcomm = DidComm(
      didResolver: PeerDidResolver(publicKey: publicKey),
      secretResolver: SecretResolverInMemoryMock(privateKey: privateKey)
    )
    let delegate = DidPromise(resolve, reject)
    
    let _ = didcomm.packEncrypted(
      msg: Message(id: id as String,
                   typ: "application/didcomm-plain+json",
                   type: messageType as String,
                   body: body as String,
                   from: from as? String,
                   to: [to as String],
                   thid: thid as String,
                   pthid: nil,
                   extraHeaders: [:],
                   createdTime: nil,
                   expiresTime: nil,
                   fromPrior: nil,
                   attachments: []),
      to: to as String,
      from: from as? String,
      signBy: nil,
      options: PackEncryptedOptions.init(
        protectSender: false,
        forward: false,
        forwardHeaders: nil,
        messagingService: nil,
        encAlgAuth: AuthCryptAlg.a256cbcHs512Ecdh1puA256kw,
        encAlgAnon: AnonCryptAlg.xc20pEcdhEsA256kw
      ),
      cb: delegate
    )
  }
  
  @objc(unpack:privateKey:withResolver:withRejecter:)
  func unpack(msg: NSString,
              privateKey: NSString,
              resolve: @escaping RCTPromiseResolveBlock,
              reject: @escaping RCTPromiseRejectBlock
  ) {
    
    let didcomm = DidComm(
      didResolver: PeerDidResolver(publicKey: privateKey),
      secretResolver: SecretResolverInMemoryMock(privateKey: privateKey)
    )
    let delegate = DidPromise(resolve, reject)
    let _ = didcomm.unpack(
      msg: msg as String,
      options: UnpackOptions(expectDecryptByAllKeys: false, unwrapReWrappingForward: false),
      cb: delegate
    )
  }
}


public class PeerDidResolver: DidResolver {
  let publicKey: NSString

      init(publicKey: NSString) {
          self.publicKey = publicKey
      }
  
  public func resolve(did: String, cb: OnDidResolverResult) -> ErrorCode {
    let verMethod = VerificationMethod(
      id: did+"#key-1",
      type: VerificationMethodType.jsonWebKey2020,
      controller: did,
      verificationMaterial: VerificationMaterial.jwk(value: publicKey as String)
//      verificationMaterial: VerificationMaterial.jwk(value: "{\"kty\":\"OKP\",\"crv\":\"X25519\",\"x\":\"avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs\"}")
    )
    
    let didDoc = DidDoc(did: did, keyAgreements: [did+"#key-1"], authentications: [], verificationMethods: [verMethod], services: [])
    try? cb.success(result: didDoc)
    return .success
  }
  
}

public class SecretResolverInMemoryMock: SecretsResolver {
  let privateKey: NSString

      init(privateKey: NSString) {
          self.privateKey = privateKey
      }
  
  public func getSecret(secretid: String, cb: OnGetSecretResult) -> ErrorCode {

    let secret = Secret(
      id: secretid,
      type: SecretType.jsonWebKey2020,
      secretMaterial: SecretMaterial.jwk(value: privateKey as String)
//      secretMaterial: SecretMaterial.jwk(value:"{\"kty\":\"OKP\",\"kid\":\""+secretid+"\",\"crv\":\"X25519\",\"x\":\"avH0O2Y4tqLAq8y9zpianr8ajii5m4F_mICrzNlatXs\",\"d\":\"r-jK2cO3taR8LQnJB1_ikLBTAnOtShJOsHXRUWT-aZA\"}")
    )
    try? cb.success(result: secret)
    return .success
  }
      
  public func findSecrets(secretids: [String], cb: OnFindSecretsResult) -> ErrorCode {
    
    try? cb.success(result: secretids)
    return .success
  }
  
}

fileprivate class DidPromise: OnPackEncryptedResult, OnPackPlaintextResult, OnPackSignedResult, OnUnpackResult {
    let resolve: RCTPromiseResolveBlock
    let reject: RCTPromiseRejectBlock
    init(_ resolve: @escaping RCTPromiseResolveBlock,
         _ reject: @escaping RCTPromiseRejectBlock) {
        self.resolve = resolve
        self.reject = reject
    }
    
    func success(result: String, metadata: PackEncryptedMetadata) {
        print("Success OnPackEncryptedResult")
        resolve([result, metadata.dataDictionary()])

    }
    
    func success(result: String) {
        print("Success OnPackPlaintextResult")
        resolve(result)
    }
    
    func success(result: String, metadata: PackSignedMetadata) {
        print("Success OnPackSignedResult")
        resolve([result, metadata.dataDictionary()])
        resolve(result)
    }
    
    func success(result: Message, metadata: UnpackMetadata) {
        print("Success OnUnpackResult")
        resolve([result.dataDictionary(), metadata.dataDictionary()])
    }
    
    func error(err: ErrorKind, msg: String) {
        print("Error: ", msg)
        reject(msg, err.localizedDescription, err)
    }
}
