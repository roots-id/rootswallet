export function replaceSpecial(alias: string) {
    return alias.replace(/[&\/\\#, +()$~%.'":*?<>{}]/g, '_');
}