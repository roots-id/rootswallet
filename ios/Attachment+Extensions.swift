import DidcommSDK

extension Attachment {
    init(fromJson json: JSONDictionary) throws {
        
        guard let dataJson = json["data"] as? JSONDictionary else {
            throw DecodeError.error("Can't resolve 'data' from Attachment.")
        }
        
        let attachmentData = try AttachmentData.fromJson(dataJson)
        self.init(data: attachmentData,
                    id: json["id"] as? String,
                    description: json["description"] as? String,
                    filename: json["filename"] as? String,
                    mediaType: json["media_type"] as? String,
                    format: json["format"] as? String,
                    lastmodTime: json["lastmod_time"] as? UInt64,
                    byteCount: json["byte_count"] as? UInt64)
    }
    
    func dataDictionary() -> JSONDictionary {
        return [ "data": self.data.dataDictionary(),
                 "id": self.id,
                 "description": self.description,
                 "filename": self.filename,
                 "media_type": self.mediaType,
                 "format": self.format,
                 "lastmod_time": self.lastmodTime,
                 "byte_count": self.byteCount ]
    }
}

extension AttachmentData {
    static func fromJson(_ data: JSONDictionary) throws -> AttachmentData {
        let jws = data["jws"] as? String
        if let base64 = data["base64"] as? String {
            return .base64(value: .init(base64: base64, jws: jws))
        } else if let json = data["json"] as? JSONDictionary {
            return .json(value: .init(json: json.asString ?? "{}" , jws: jws))
        } else if let links = data["links"] as? [String] {
            let hash = data["hash"] as? String ?? ""
            return .links(value: .init(links: links, hash: hash, jws: jws))
        } else {
            throw DecodeError.error("AttachmentData not supported! Supported types: 'base64', 'json' and 'links'.")
        }
    }
    
    func dataDictionary() -> JSONDictionary {
        switch self {
        case .base64(let value):
            return ["base64": value.base64, "jws": value.jws]
        case .json(let value):
            return ["json": value.json, "jws": value.jws]
        case .links(let value):
            return ["links": value.links, "hash": value.hash,"jws": value.jws]
        }
    }
}
