import Relationship from "../models/relationship"

export const getRelationships = () => {
    console.log('>getRelationships()...');
    const rels =
        [
            {id: 1, type: 'issuer', key: 'IOG Tech Community', email: 'community@iohk.io', icon: 'icons/techcommunity'},
            {id: 2, type: 'issuer', key: 'RootsID', email: 'rootswallet@rootsid.com', icon: 'icons/rootsid'},
            {id: 3, type: 'issuer', key: 'MeGrimLance', email: 'lance.byrd@xyz.com', icon: 'icons/lance'},
            {id: 4, type: 'issuer', key: 'Tony.Rose', email: 'tony.rose@iohk.io', icon: 'icons/tonyrose'}
        ]

    // console.log(JSON.stringify(rels))
    console.log(`relationships length: ${rels.length}`)
    return rels
}

// module.exports = {getRelationships}