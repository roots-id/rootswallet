export function showQR(navigation: any, data: string) {
    console.log("ChatScreen - Showing QR data",data)
    navigation.navigate('Show QR Code', {qrdata: data})
}