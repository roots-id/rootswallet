//
//  pack-unpack.swift
//  rootswallet
//
//  Created by Rodolfo Miranda on 1/28/23.
//


import DidcommSDK
import Foundation
import Base58Swift

@objc(PackUnpack)
class PackUnpack: NSObject {

  @objc(packEncrypted:id:thid:to:from:messageType:customHeaders:privateKey:signFrom:protectSender:attachments:withResolver:withRejecter:)
  func packEncrypted(body: NSString,
                     id: NSString,
                     thid: NSString,
                     to: NSString,
                     from: NSString? = nil,
                     messageType: NSString,
                     customHeaders: NSDictionary,
                     privateKey: NSString,
                     signFrom: Bool,
                     protectSender: Bool,
                     attachments: NSArray,
                     resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock
  ) {
    let didcomm = DidComm(
      didResolver: PeerDidResolver(),
      secretResolver: SecretResolverInMemoryMock(privateKey: privateKey)
    )
    let delegate = DidPromise(resolve, reject)
    
    var attachs = [Attachment]()
    
    for _att in attachments {
      do {
        let dataDict = _att as! NSDictionary
        var dataJSON: JSONDictionary = [
          "json": dataDict as! JSONDictionary
        ]
        let attData = try AttachmentData.fromJson(dataJSON)
        let att = Attachment(data: attData, id: "hghgj", description: nil, filename: nil, mediaType: nil, format: nil, lastmodTime: nil, byteCount: nil)
        attachs.append(att)
      } catch {
        print("Unexpected Attachment error: \(error)")
      }
      
    }
    

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
                   attachments: attachs),
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
      didResolver: PeerDidResolver(),
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

//  init() {
//      //
//  }
  
  public func resolve(did: String, cb: OnDidResolverResult) -> ErrorCode {
    // get keys by splitting and removing firt element
    var keys = did.split(separator: ".")
    keys.removeFirst()
    var verificationMethods = [VerificationMethod]()
    
    // find keyAgreement and extract publicKeyMultibase
    var kidE = ""
    var kidV = ""
    for key in keys {
      if key.prefix(1) == "E" {
        kidE = did + "#" + key.suffix(key.count - 2 ) // remove E and z
        let publicKeyMultibase = String(key.suffix(key.count - 1 )) // remove E
        let multicodec = Base58.base58Decode((String(publicKeyMultibase.suffix(publicKeyMultibase.count - 1 ))))

        let data = Data(multicodec![2...])
        let publicKeyBase64 = data.base64EncodedString(options: NSData.Base64EncodingOptions(rawValue: 0)).replacingOccurrences(of: "=", with: "").replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_")
        let publicJwt = "{\"kty\":\"OKP\",\"crv\":\"X25519\",\"x\":\"" + publicKeyBase64 + "\",\"kid\":\"" + kidE+"\"}"
        
        let verMethod = VerificationMethod(
          id: kidE,
          type: VerificationMethodType.jsonWebKey2020,
          controller: did,
          verificationMaterial: VerificationMaterial.jwk(value: publicJwt as String)
        )
        verificationMethods.append(verMethod)
      }
      if key.prefix(1) == "V" {
        kidV = did + "#" + key.suffix(key.count - 2 ) // remove E and z
        let publicKeyMultibase = String(key.suffix(key.count - 1 )) // remove E
        let multicodec = Base58.base58Decode((String(publicKeyMultibase.suffix(publicKeyMultibase.count - 1 ))))

        let data = Data(multicodec![2...])
        let publicKeyBase64 = data.base64EncodedString(options: NSData.Base64EncodingOptions(rawValue: 0)).replacingOccurrences(of: "=", with: "").replacingOccurrences(of: "+", with: "-").replacingOccurrences(of: "/", with: "_")
        let publicJwt = "{\"kty\":\"OKP\",\"crv\":\"Ed25519\",\"x\":\"" + publicKeyBase64 + "\",\"kid\":\"" + kidV+"\"}"
        
        let verMethod = VerificationMethod(
          id: kidV,
          type: VerificationMethodType.jsonWebKey2020,
          controller: did,
          verificationMaterial: VerificationMaterial.jwk(value: publicJwt as String)
        )
        verificationMethods.append(verMethod)
      }
    }

    // convert multibase to jwk

    
    let didDoc = DidDoc(did: did, keyAgreements: [kidE], authentications: [kidV], verificationMethods: verificationMethods, services: [])
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
