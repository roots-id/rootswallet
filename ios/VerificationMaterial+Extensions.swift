import DidcommSDK

extension VerificationMaterial {
    static func fromString(_ format: String, value: String) -> VerificationMaterial{
        switch format.lowercased() {
        case "jwk":
            return .jwk(value: value)
        case "multibase":
            return .multibase(value: value)
        case "base58":
            return .base58(value: value)
        case "hex":
            return .hex(value: value)
        default:
            return .other(value: value)
        }
    }
}

