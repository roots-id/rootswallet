import {displayProblem} from "../styles/styles";
import {Text} from "react-native";
import React from "react";
import {decodeCredential} from "../credentials";

export function getObjectField(obj: object, field: string) {
    for (const [key, value] of Object.entries(obj)) {
        if(key === field) {
            return value;
        }
    }
}

export function replaceSpecial(alias: string) {
    return alias.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_');
}

export function recursivePrint(val: any, indent="\t") {
    let printMe = ""
    if(val !== undefined) {
        if (val.constructor === Object) {
            //console.log("utils - recursive printing object",val)
            indent = indent + "\t"
            Object.keys(val).forEach(key => {
                printMe = printMe + "\n" + indent + key + ":" + recursivePrint(val[key], indent)
            })
        } else if (Array.isArray(val)) {
            //console.log("utils - recursive printing array",val)
            printMe = printMe + "\t["
            val.forEach(v => {
                printMe = printMe + "\t" + recursivePrint(v, indent) + ","
            })
            printMe = printMe + "]"
        } else {
            //console.log("utils - recursive printing literal",val)
            printMe = printMe + "\t" + val
        }
    } else {
        console.log("utils - wont recursive print an undefined val",val)
    }

    return printMe;
}