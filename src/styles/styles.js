import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    bigBlue: {
        color: 'blue',
        fontWeight: 'bold',
        fontSize: 30,
    },
    button: {
        width: 200,
        borderRadius: 10,
        backgroundColor: '#e69138',
        alignSelf: 'center',
        marginTop: 10,
    },
    buttonText: {
        marginHorizontal: 10,
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
        alignSelf: 'center'

    },
    cardano: {
        color: '#1c04ba'
    },
    clickableListArchive: {
        fontSize: 16,
        color: '#c66108',
    },
    clickableListTitle: {
        fontSize: 22,
        color: '#e69138',
    },
    closeButtonContainer: {
        position: 'absolute',
        top: 30,
        right: 0,
        zIndex: 1,
    },
    container: {
        backgroundColor: '#251520',
        flex: 1,
        justifyContent: 'center',
    },
    containerCenter: {
        backgroundColor: '#251520',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    credLogoStyle: {
        width:65,
        height:75,
        resizeMode:'contain',
        margin:8
    },
    detailTitle: {
        fontSize: 20,
        color: '#111111',
    },
    email: {
        textDecorationLine: 'underline',
    },
    hashTag: {
        fontStyle: 'italic',
    },
    header: {
        color: '#999999',
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 15,
        marginBottom: 20

    },
    headingText: {
        fontSize: 18,
        marginBottom: 10,
        color: '#ff9138',
        fontWeight: 'normal',
        alignSelf: "flex-start",
        justifyContent: "flex-start"
    },
    highlightedItem: {
        fontSize: 18,
        fontWeight: "bold"
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        marginTop: 10,
        marginBottom: 10,
        width: 250,
        height: 70,
    },
    inputStyle: {
        flex: 1,
        // autoCorrect: false,
        // autoComplete: 'off',
        // autoCapitalize: 'none',
        padding: 10,
        borderWidth: 1,
        borderColor: 'black',
        marginHorizontal: 15,
        marginVertical: 20,
        borderRadius: 5,
        backgroundColor: 'pink',
        alignSelf: 'center'
    },
    item: {
        backgroundColor: '#20190e',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    leftHeader: {
        color: '#999999',
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 15,
        alignSelf: "flex-start",
        justifyContent: "flex-start"

    },
    listItem: {
        fontSize: 18,
        color: '#eeeeee',
    },
    listItemCenteredBlack: {
        fontSize: 18,
        marginBottom: 10,
        color: '#111111',
        fontWeight: 'normal',
        textAlignVertical: "center",
        textAlign: "center",
    },
    listTitle: {
        fontSize: 22,
        color: '#dddddd',
    },
    listDescription: {
        fontSize: 16,
        color: '#dddddd',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonLabel: {
        fontSize: 16,
    },
    magicNumber: {
        fontSize: 42,
        color: 'pink',
    },
    centeredContainer: {
        backgroundColor: '#251520',
        flex: 1,
        padding: 16,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        color: 'red',
    },
    navButtonText: {
        fontSize: 16,
    },
    none: {
        display: 'none'
    },
    phone: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    pressable: {
        position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    prism: {
        color: '#940000',
        textDecorationLine: 'underline',
    },
    problem: {
        color: '#ff5521',
    },
    qr: {
        color: 'orange',
    },
    red: {
        color: 'red',
    },
    rootsWallet: {
        color: '#e69138'
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    scrollableModal: {
        padding: 16,
        width: '95%',
        maxWidth: 350,
        maxHeight: 250,
        borderRadius: 3,
        backgroundColor: '#cfbfca',
    },
    subText: {
        fontSize: 16,
        marginBottom: 10,
        color: '#111111',
        fontWeight: 'normal',
        alignSelf: "flex-start",
        justifyContent: "flex-start"
    },
    text: {
        color: 'blue',
        fontSize: 15,
    },
    titleText: {
        fontSize: 24,
        marginBottom: 10,
        color: '#eeeeee',
        fontWeight: 'normal',
        textAlignVertical: "center",
        textAlign: "center",
    },
    titleTextOrange: {
        fontSize: 24,
        marginBottom: 10,
        color: '#ff9138',
    },
    videoContainer: {
        marginTop: 50,
    },
    urlBlue: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    urlRed: {
        color: 'red',
        textDecorationLine: 'underline',
    },
    username: {
        color: 'green',
        fontWeight: 'bold',
    },
    viewAnimated: {
        padding: 16,
        width: '90%',
        height: '95%',
        maxWidth: 400,
        borderRadius: 3,
        backgroundColor: '#cfbfca',
        alignItems: 'center',
        justifyContent: 'center',
    },
    walletIconStyle: {
        fontSize: 24,
        color: 'blue',
        alignSelf: 'center',
        marginHorizontal: 5,
        marginVertical: 20
    },
    walletInputStyle: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 15,
        height: 50,
        backgroundColor: '#F0EEEE'
    },
})

export function displayProblem(displayIt) {
    if(!displayIt){
        return styles.none
    }
    else{
        return styles.problem
    }
}
