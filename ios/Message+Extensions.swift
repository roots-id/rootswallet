import DidcommSDK

extension Message {
    func dataDictionary() -> JSONDictionary {
        
        let attachmentsJson = self.attachments?.map { attachment  in
            return attachment.dataDictionary()
        }
        
        return [ "id": self.id,
                 "typ": self.typ,
                 "type": self.type,
                 "body": self.body.asDictionary,
                 "from": self.from,
                 "to": self.to,
                 "thid": self.thid,
                 "pthid": self.pthid,
                 "extraHeaders": self.extraHeaders,
                 "createdTime": self.createdTime,
                 "expiresTime": self.expiresTime,
                 "fromPrior": self.fromPrior,
                 "attachments": attachmentsJson ]
    }
    
    init(fromJson json: NSDictionary) throws {
    
        guard let id = json["id"] as? String else {
            throw DecodeError.error("Can't resolve 'id' from Message.")
        }
        
        guard let typ = json["typ"] as? String else {
            throw DecodeError.error("Can't resolve 'typ' from Message.")
        }
        
        guard let type = json["type"] as? String else {
            throw DecodeError.error("Can't resolve 'type' from Message.")
        }
        
        guard let bodyJson = json["body"] as? JSONDictionary,
              let body = bodyJson.asString else {
            throw DecodeError.error("Can't resolve 'body' from Message.")
        }
       
        var attachments: [Attachment]?
        
        if let attachmentsJson = json["attachments"] as? [JSONDictionary] {
            attachments = try attachmentsJson.map { attachmentJson in
                return try .init(fromJson: attachmentJson)
            }
        }
        
        self.init(id: id,
                  typ: typ,
                  type: type,
                  body: body,
                  from: json["from"] as? String,
                  to: json["to"] as? [String],
                  thid: json["thid"] as? String,
                  pthid: json["pthid"] as? String,
                  extraHeaders: json["extraHeaders"]  as? [String: String] ?? [:],
                  createdTime: json["createdTime"] as? UInt64,
                  expiresTime: json["expiresTime"] as? UInt64,
                  fromPrior: json["fromPrior"] as? String,
                  attachments: attachments)
    }
}
