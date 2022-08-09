import React, {useEffect, useState} from 'react';
import {
    Animated,
    Text,
    Pressable,
    View, NativeModules, Button,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useCardAnimation} from '@react-navigation/stack';
import {IconButton, ToggleButton} from 'react-native-paper';
import {styles} from "../styles/styles";
const {CustomBackup} = NativeModules;

import * as roots from '../roots'
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import * as store from "../store";
import FormButton from "../components/FormButton";
import RNFS, {ReadDirItem} from "react-native-fs";
import { zip } from 'react-native-zip-archive'

export default function SaveScreen({route, navigation}: CompositeScreenProps<any, any>) {
    // const [demoMode, setDemoMode] = useState<boolean>(roots.isDemo())
    const {current} = useCardAnimation();

    async function saveWallet() {
        console.log("Save wallet")

        // require the module
        const RNFS = require('react-native-fs');

// create a path you want to write to
// :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
// but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
        const zipPath = RNFS.DocumentDirectoryPath + '/rootswallet_backup.zip';
        const sourcePath = RNFS.DocumentDirectoryPath + '/rootswallet-backup';

        if(await RNFS.exists(sourcePath)) {
            console.log("Previous backup dir exists", sourcePath)
            const archivePath = RNFS.DocumentDirectoryPath + '/rootswallet-backup' + Date.now();
            console.log("Archiving backup dir at", archivePath)
            await RNFS.mkdir(archivePath)
            console.log("Created archiving backup dir ", archivePath)
            const dirItems: ReadDirItem[] = await RNFS.readDir(sourcePath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined
            console.log("We need to move files to archive",dirItems)
            dirItems.forEach((dirItem, i) => {
//                console.log('File# ', i);
                console.log('Moving file', sourcePath+"/"+dirItem, ' to ',archivePath+"/"+dirItem);
//                console.log('RNFS stat',RNFS.stat(dirItem.path), dirItem.path);
                RNFS.moveFile(sourcePath+dirItem,archivePath+dirItem)
                console.log('Moved file', sourcePath+"/"+dirItem, 'to',archivePath+"/"+dirItem);
            })
        }

        zip(sourcePath, zipPath)
            .then((path) => {
                console.log(`zip completed at ${path}`)
            })
            .catch((error) => {
                console.error(error)
            })

// write the file
        var output = 'Lorem ipsum dolor sit amet'.repeat(Math.floor(Math.random() * 10))
        console.log("writing output",output)
        await RNFS.writeFile(zipPath, output, 'utf8')
        console.log('FILE WRITTEN ',zipPath);

// get a list of files and directories in the main bundle



            // .then((statResult) => {
            //     if (statResult[0].isFile()) {
            //         // if we have a file, read it
            //         return RNFS.readFile(statResult[1], 'utf8');
            //     }
            //     return 'no file';
            // })
            // .then((contents) => {
            //     // log the file contents
            //     console.log(contents);
            // })
            // .catch((err) => {
            //     console.log(err.message, err.code);
            // });

        console.log("Marking wallet for backup")
        CustomBackup.backup()
    }

    // useEffect(() => {
    //     roots.setPrismHost(host)
    // }, [host]);
    //
    // useEffect(() => {
    //     roots.setDemo(demoMode)
    // }, [demoMode]);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Pressable
                style={styles.pressable}
                onPress={navigation.goBack}
            />
            <Animated.View
                style={styles.viewAnimated}
            >
                    <IconButton
                        icon="close-circle"
                        size={36}
                        color="#e69138"
                        onPress={() => navigation.goBack()}
                    />
                    <FormButton
                        title="Save Wallet"
                        modeValue="contained"
                        labelStyle={styles.loginButtonLabel}
                        onPress={async () => saveWallet()}/>
            </Animated.View>
        </View>
    );
}
