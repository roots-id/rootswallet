import DidcommSDK

extension DidDoc {
    
    init(fromJson json: JSONDictionary) throws {
        guard let did = json["did"] as? String else {
            throw DecodeError.error("Can't resolve 'did' from DidDoc.")
        }
        
        guard let keyAgreements = json["key_agreements"] as? [String] else {
            throw DecodeError.error("Can't resolve 'key_agreements' from DidDoc.")
        }
        
        guard let authentications = json["authentications"] as? [String] else {
            throw DecodeError.error("Can't resolve 'authentications' from DidDoc.")
        }
        
        
        guard let verificationMethodsJson = json["verification_methods"] as? [JSONDictionary] else {
            throw DecodeError.error("Can't resolve 'verification_methods' from DidDoc.")
        }
        
        guard let servicesJson = json["services"] as? [JSONDictionary] else {
            throw DecodeError.error("Can't resolve 'services' from DidDoc.")
        }
        
        let vMethods: [VerificationMethod] = try verificationMethodsJson.map { verificationMethodJson in
            return try VerificationMethod(fromJson: verificationMethodJson)
        }
        
        let services: [Service] = try servicesJson.map { serviceJson in
            return try Service(fromJson: serviceJson)
        }
        
        self.init(did: did,
                  keyAgreements: keyAgreements,
                  authentications: authentications,
                  verificationMethods: vMethods,
                  services: services)
    }
}

extension VerificationMethod {
    init(fromJson json: JSONDictionary) throws {
        
        guard let id = json["id"] as? String else {
            throw DecodeError.error("Can't resolve 'id' from VerificationMethod.")
        }

        guard let type = json["type"] as? String else {
            throw DecodeError.error("Can't resolve 'type' from VerificationMethod.")
        }
        
        guard let controller = json["controller"] as? String else {
            throw DecodeError.error("Can't resolve 'controller' from VerificationMethod.")
        }
        
        guard let verificationMaterialJson = json["verification_material"] as? JSONDictionary else {
            throw DecodeError.error("Can't resolve 'verification_material' from VerificationMethod.")
        }
        
        guard let format =  verificationMaterialJson["format"] as? String else {
            throw DecodeError.error("Can't resolve 'format' from Verification Material.")
        }
        
        if let value = verificationMaterialJson["value"] as? String {
            self.init(id: id,
                      type: .fromString(type),
                      controller: controller,
                      verificationMaterial: .fromString(format,
                                                        value: value))
        } else if let valueJson = verificationMaterialJson["value"] as? JSONDictionary,
                  let value = valueJson.asString{
            self.init(id: id,
                      type: .fromString(type),
                      controller: controller,
                      verificationMaterial: .fromString(format,
                                                        value: value))
        } else {
            throw DecodeError.error("Can't resolve 'value' from Verification Material.")
        }
    }
}
