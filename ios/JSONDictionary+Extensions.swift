typealias JSONDictionary = [String : Any?]

extension JSONDictionary {
    var asString: String? {
        guard let data = try? JSONSerialization.data(withJSONObject: self, options: .prettyPrinted) else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }
}
