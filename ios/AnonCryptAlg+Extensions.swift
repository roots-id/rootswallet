import DidcommSDK

extension AnonCryptAlg {
    static func fromString(_ type: String) throws -> AnonCryptAlg {
        switch type {
        case "A256cbcHs512EcdhEsA256kw":
            return .a256cbcHs512EcdhEsA256kw
        case "Xc20pEcdhEsA256kw":
            return .xc20pEcdhEsA256kw
        case "A256gcmEcdhEsA256kw":
            return .a256gcmEcdhEsA256kw
        default:
            throw DecodeError.error("AnonCryptAlg not supported! Supported types: 'A256cbcHs512EcdhEsA256kw', 'Xc20pEcdhEsA256kw' and 'A256gcmEcdhEsA256kw'.")
        }
    }
}
