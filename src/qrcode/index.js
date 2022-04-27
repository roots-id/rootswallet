import {logger} from '../logging';
import QRCode from 'react-native-qrcode-svg';

export function getQrCode(data) {
    logger("get qr code for", data)
    return (
        <QRCode value={data}/>
    );
}