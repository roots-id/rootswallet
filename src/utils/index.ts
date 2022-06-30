export function replaceSpecial(alias: string) {
    return alias.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_');
}

export function recursivePrint(val, indent="\t") {
    let printMe = ""
    if(val.constructor === Object) {
        //console.log("utils - recursive printing object",val)
        indent = indent+"\t"
        Object.keys(val).forEach(key => {
            printMe = printMe + "\n"+indent+key+":"+recursivePrint(val[key],indent)
        })
    } else if(Array.isArray(val)) {
        //console.log("utils - recursive printing array",val)
        printMe = printMe+"\t["
        val.forEach(v=>{
            printMe = printMe + "\t" + recursivePrint(v,indent) + ","
        })
        printMe = printMe + "]"
    } else {
        //console.log("utils - recursive printing literal",val)
        printMe = printMe + "\t" + val
    }

    return printMe;
}