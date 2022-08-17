export function getJsonFromMap(map: Map<string,string>) : string {
    const entryArray = Array.from(map.entries()).reduce((o,[key,value]) => {
        o[key] = value;
        return o;
    },{})
    const jsonStr = JSON.stringify(entryArray)
    console.log("utils - got json from map",jsonStr)
    return jsonStr
}

export function getMapFromJson(jsonStr: string) : Map<string,string> {
    console.log("utils - getting map from json",jsonStr)
    const mapJson: Object = JSON.parse(jsonStr)
    const map: Map<string,string> = new Map<string,string>()
    console.log("utils - map from json is",mapJson)
    // ✅ forEach after Object.entries (better)
    Object.entries(mapJson).forEach(([key, value], index) => {
        // 👇️ name Tom 0, country Chile 1
        console.log("Adding to map",key, value, index);
        map.set(key,value)
    });
    return map
}

export function getObjectField(obj: object|undefined|Readonly<object|undefined>, field: string) {
    if(obj) {
        for (const [key, value] of Object.entries(obj)) {
            if (key === field) {
                return value;
            }
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
