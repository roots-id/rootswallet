import DidcommSDK

extension FromPrior {
    func dataDictionary() -> [String: Any?] {
        return [ "iss": iss,
                 "sub": sub,
                 "aud": aud,
                 "exp": exp,
                 "nbf": nbf,
                 "iat": iat,
                 "jti": jti ]
    }
    
    init(fromJson fromPrior: NSDictionary) throws {
        
        guard let iss = fromPrior.value(forKey: "iss") as? String  else {
            throw DecodeError.error("Can't resolve 'iss' from FromPrior.")
        }
        
        guard let sub = fromPrior.value(forKey: "sub") as? String else {
            throw DecodeError.error("Can't resolve 'sub' from FromPrior.")
        }
        
        self.init(iss: iss,
                  sub: sub,
                  aud: fromPrior.value(forKey: "aud") as? String,
                  exp: fromPrior.value(forKey: "exp") as? UInt64,
                  nbf: fromPrior.value(forKey: "nbf") as? UInt64,
                  iat: fromPrior.value(forKey: "iat") as? UInt64,
                  jti: fromPrior.value(forKey: "jti") as? String)
    }
}
