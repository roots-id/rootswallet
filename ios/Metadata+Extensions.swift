import DidcommSDK

extension PackEncryptedMetadata {
    func dataDictionary() -> [String: Any?] {
        return [ "messagingService": self.messagingService?.dataDictionary(),
                 "fromKid": self.fromKid,
                 "signByKid": self.signByKid,
                 "toKids": self.toKids ]
    }
}

extension MessagingServiceMetadata {
    func dataDictionary() -> [String: Any?] {
        return [ "id": self.id,
                 "serviceEndpoint": self.serviceEndpoint ]
    }
}

extension PackSignedMetadata {
    func dataDictionary() -> [String: Any?] {
        return [ "signByKid": self.signByKid ]
    }
}

extension UnpackMetadata {
    func dataDictionary() -> [String: Any?] {
        return [ "encrypted": self.encrypted,
                 "authenticated": self.authenticated,
                 "nonRepudiation": self.nonRepudiation,
                 "anonymousSender": self.anonymousSender,
                 "reWrappedInForward": self.reWrappedInForward,
                 "encryptedFromKid": self.encryptedFromKid,
                 "encryptedToKids": self.encryptedFromKid,
                 "signFrom": self.signFrom,
                 "fromPriorIssuerKid": self.fromPriorIssuerKid,
                 "encAlgAuth": self.encAlgAuth,
                 "encAlgAnon": self.encAlgAnon,
                 "signAlg": self.signAlg,
                 "signedMessage": self.signedMessage,
                 "fromPrior": self.fromPrior?.dataDictionary()]
    }
}
