import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import { createDIDPeer} from '../didpeer'
import { decodeOOBURL } from '../protocols';
import { credentialRequest } from '../protocols';
import uuid from 'react-native-uuid';



const RequestCredential = (props) => {

    const [didToIssuer, setDidToIssuer] = useState('')
    const [issuerDID, setIssuerDID] = useState('')
    const [credential, setCredential] = useState('')

    const getIssuer = async () => {
        try {
            // GET Issuer OOB URL and decode issuer public DID. 
            // It can also be a QR scan (qrcode image in https://mediator.rootsid.cloud/oob_qrcode)
            const response = await fetch(
            'https://mediator.rootsid.cloud/oob_url'
            //'http://127.0.0.1:8000/oob_url'
            );
            const oob_url = await response.text();
            const decodedMsg = await decodeOOBURL(oob_url)
            setIssuerDID(decodedMsg.from)
            
            // Create DID to communicate with Issuer
            const  myDid = await createDIDPeer(null,null)
            setDidToIssuer(myDid)

        } catch (error) {
            console.error(error);
        }
    }

    const requestCredential = async () => {
        try {
            const myPrismDID = "did:prism:a08f49e61bc46dc82b6bd54dd62087c25b53b4a7ef98e549ce62ee4ad3450d5c"
            // Request a credential
            const requested_credential = {
                "credential": {
                    "@context": 
                    [
                        "https://www.w3.org/2018/credentials/v1",
                        "https://www.w3.org/2018/credentials/examples/v1"
                    ],
                    "id": uuid.v4(),
                    "type": ["VerifiableCredential", "UniversityDegreeCredential"],
                    "issuer": "TBD",
                    "issuanceDate": "%Y-%m-%dT%H:%M:%SZ",
                    "credentialSubject": 
                        {
                          "id": myPrismDID,
                          "degree": 
                            {
                                "type": "BachelorDegree",
                                "name": "Bachelor of Science and Arts"
                              }
                        },
                    "options": {
                        "proofType": "EcdsaSecp256k1Signature2019"
                    }
                }
            }
            const resp = await credentialRequest(didToIssuer, issuerDID, requested_credential)
            setCredential(JSON.stringify(resp))
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <View>
            <Button
                title='Scan Issuer QR'
                color='#239B56'
                onPress={getIssuer}
            />
            <Text>{issuerDID}</Text>
            <Button
                title='Request Credential'
                color='#239B56'
                onPress={requestCredential}
            />
            <Text>
                {credential}
            </Text>

        </View>
    );
};

export default RequestCredential