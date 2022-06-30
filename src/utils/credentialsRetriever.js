const getCredentials = (indx) => {
    console.log(`>getCredentials( ${indx} )...`);
    const creds = new Map()

    const credlist1 = [
        {key: 'CommunityMember', value: "true", relid: 1, id: 1},
    ]

    const credlist2 = [
        {key: 'CommunityMember', value: "true", relid: 1, id: 1},
        {key: 'RootsIDMember', value: "true", relid: 2, id: 2},
    ]

    const credlist3 = [
        {key: 'FrontDoorAccess', value: "true", relid: 1, id: 1},
        {key: 'DogGroomingAuthority', value: "true", relid: 2, id: 2},
        {key: 'DogPickupAuthority', value: "false", relid: 2, id: 2},
    ]

    const credlist4 = [
        {key: 'Astronaut', value: "true", relid: 1, id: 1},
    ]


    creds.set('IOG Tech Community',credlist1)
    creds.set('RootsID',credlist2)
    creds.set('MeGrimLance',credlist3)
    creds.set('Tony.Rose',credlist4)

    return creds.get(indx)
}
const getCredential = (creds, key) =>{
    console.log(`> getCredential(creds, ${key} )`)
    return creds.filter(c => c.key == key)
}

module.exports = {getCredentials, getCredential}