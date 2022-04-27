import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
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
    button:{
        width: 150,
        borderRadius: 10,
        backgroundColor: 'gold',
        alignSelf: 'center'
    },
    buttonText:{
        marginHorizontal: 10,
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        alignSelf: 'center'

    },
    header: {
            color: '#999999',
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 15,
        marginBottom: 20

    },
    leftheader: {
        color: '#999999',
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 15,
        alignSelf: "flex-start",
        justifyContent: "flex-start"

    },
    container: {
        backgroundColor: '#251520',
        flex: 1,

    },
    text: {
        fontSize: 30,
    },
    listItem: {
        fontSize: 18,
        color: '#eeeeee',

    },
      listTitle: {
        fontSize: 22,
        color: '#dddddd',
      },
      listDescription: {
        fontSize: 16,
        color: '#dddddd',
      },
      item: {
          backgroundColor: '#20190e',
          padding: 20,
          marginVertical: 8,
          marginHorizontal: 16,
        },
    highlightedItem: {
        fontSize: 18,
        fontWeight: "bold"
    },

})

export default styles