import DidcommSDK
import Foundation

extension PackEncryptedOptions {
    init(fromJson json: NSString?) {
        if let optionsJson = json,
           let optionsDic = optionsJson.asString.asDictionary {
            
            let encAlgAnon: AnonCryptAlg? = try? .fromString(optionsDic["enc_alg_anon"] as? String ?? "")
            self.init(protectSender: optionsDic["protect_sender"] as? Bool ?? false,
                                     forward: optionsDic["forward"] as? Bool ?? true,
                                     forwardHeaders: optionsDic["forward_headers"] as? [String: String],
                                     messagingService: optionsDic["messaging_service"] as? String,
                                     encAlgAuth: .a256cbcHs512Ecdh1puA256kw, // only supported
                                     encAlgAnon: encAlgAnon ?? .xc20pEcdhEsA256kw)
        } else {
            // This is the standard options for Encrypting.
            self.init(protectSender: false,
                 forward: true,
                 forwardHeaders: nil,
                 messagingService: nil,
                 encAlgAuth: .a256cbcHs512Ecdh1puA256kw,
                 encAlgAnon: .xc20pEcdhEsA256kw)
        }
    }
}
