import DidcommSDK

extension SecretType {
    static func fromString(_ type: String) -> SecretType{
        switch type {
        case "JsonWebKey2020":
            return .jsonWebKey2020
        case "X25519KeyAgreementKey2019":
            return .x25519KeyAgreementKey2019
        case "Ed25519VerificationKey2018":
            return .ed25519VerificationKey2018
        case "EcdsaSecp256k1VerificationKey2019":
            return .ecdsaSecp256k1VerificationKey2019
        case "X25519KeyAgreementKey2020":
            return .x25519KeyAgreementKey2020
        case "Ed25519VerificationKey2020":
            return .ed25519VerificationKey2020
        default:
            return .other
        }
    }
}
