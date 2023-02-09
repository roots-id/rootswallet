extension String {
    var asDictionary: [String:Any?]? {
        guard let data = self.data(using: .utf8) else {
            return nil
        }
        return try? JSONSerialization.jsonObject(with: data) as? [String: Any?]
    }

    var asArray: [String]? {
        guard let data = self.data(using: .utf8) else {
            return nil
        }
        return try? JSONSerialization.jsonObject(with: data) as? [String]
    }
}

public extension NSString {
    var asString: String {
        return self as String
    }
}
