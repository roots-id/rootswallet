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
    clickableListTitle: {
      fontSize: 22,
      color: '#e69138',
    },
    container: {
        backgroundColor: '#251520',
        flex: 1,
        justifyContent: 'center',
    },
    detailTitle: {
        fontSize: 20,
        color: '#111111',
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
    leftheader: {
        color: '#999999',
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 15,
        alignSelf: "flex-start",
        justifyContent: "flex-start"

    },
    text: {
        fontSize: 30,
    },
    titleText: {
        fontSize: 24,
        marginBottom: 10,
        color: '#eeeeee',
        fontWeight: 'normal',
        textAlignVertical: "center",
        textAlign: "center",
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
    modalContainer: {
        backgroundColor: '#251520',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    loginButtonLabel: {
      fontSize: 22,
    },
    navButtonText: {
      fontSize: 16,
    },
  none: {
      display: 'none'
  },
  prism: {
    color: '#940000',
    textDecorationLine: 'underline',
  },
  problem: {
      color: 'red',
  },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
  subText: {
      fontSize: 16,
      marginBottom: 10,
      color: '#111111',
      fontWeight: 'normal',
      alignSelf: "flex-start",
      justifyContent: "flex-start"
  },
})

export default styles