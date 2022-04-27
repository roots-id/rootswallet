import * as qrcode from '../qrcode'

export default function ShowQRCodeScreen({ navigation }) {
  return qrcode.getQrCode("http://awesome.link.qr");
}