import DidcommSDK

import UIKit
extension Secret {
    init(fromJson json: JSONDictionary) throws {
        
        guard let id = json["id"] as? String else {
            throw DecodeError.error("Can't resolve 'id' from Secret.")
        }
        
        guard let type = json["type"] as? String else {
            throw DecodeError.error("Can't resolve 'type' from Secret.")
        }
        
        guard let secretMaterialJson = json["secret_material"] as? NSDictionary else {
            throw DecodeError.error("Can't resolve 'secret_material' from Secret Material.")
        }
        
        guard let format = secretMaterialJson.value(forKey: "format") as? String else {
            throw DecodeError.error("Can't resolve 'format' from Secret.")
        }
        
        
        if let value = secretMaterialJson.value(forKey: "value") as? String {
            self.init(id: id, type: .fromString(type),
                      secretMaterial: .fromString(format,
                                                  value: value))
        } else if let valueJson = secretMaterialJson.value(forKey: "value") as? JSONDictionary,
                  let value = valueJson.asString{
            self.init(id: id, type: .fromString(type),
                      secretMaterial: .fromString(format,
                                                  value: value))
        } else {
            throw DecodeError.error("Can't resolve 'value' from Secret.")
        }
    }
}

