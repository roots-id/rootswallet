import DidcommSDK
import Foundation

extension UnpackOptions {
    init(fromJson json: NSString?) {
        if let optionsJson = json,
           let optionsDic = optionsJson.asString.asDictionary {
            self.init(expectDecryptByAllKeys: optionsDic["expect_decrypt_by_all_keys"] as? Bool ?? false,
                      unwrapReWrappingForward: optionsDic["unwrap_re_wrapping_forward"] as? Bool ?? false)
        } else {
            self.init(expectDecryptByAllKeys: false,
                      unwrapReWrappingForward: false)
        }
    }
}
