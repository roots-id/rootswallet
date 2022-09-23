import * as models from '../models'

export function showQR(navigation: any, data: models.contactDecorator|models.vc|undefined) {
    if(data) {
        console.log("QR code - Showing QR data", data)
        navigation.navigate('Show QR Code', {qrdata: data})
    } else {
        console.error("Not showing undefined data",data)
    }
}
