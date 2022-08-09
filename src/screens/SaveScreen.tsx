import React, {useEffect, useState} from 'react';
import {
    Animated,
    Pressable,
    View, NativeModules, FlatList, ScrollView,
} from 'react-native';
import {useCardAnimation} from '@react-navigation/stack';
import {Divider, IconButton, List} from 'react-native-paper';
import {styles} from "../styles/styles";

const {CustomBackup} = NativeModules;

import * as roots from '../roots'
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import * as store from "../store";
import FormButton from "../components/FormButton";
import RNFS, {ReadDirItem} from "react-native-fs";
import {zip} from 'react-native-zip-archive'


export default function SaveScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("save screen - params", route.params)

    const {current} = useCardAnimation();
    const RW_BACKUP = "rootswallet_backup";

    const [refresh, setRefresh] = useState(true)
    const [archives, setArchives] = useState<ReadDirItem[]>([])
    const [selection, setSelection] = useState<ReadDirItem>()

    useEffect(() => {
        const fetchData = async () => {
            await refreshItems()
        }

        // call the function
        fetchData()
    }, [,selection])

    async function refreshItems(item?: ReadDirItem) {
        console.log("save screen - toggling refresh")
        setArchives(
            await getArchiveItems()
        )
        setRefresh(!refresh)
        console.log("save screen - contacts size", archives.length)

        if(item) {
            setSelection(item)
        }
    }

    async function getArchiveItems() {
        const dirItems: ReadDirItem[] = await RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined
        const archiveItems = dirItems.filter(item => {
            console.log("is an archive item?", item.name, "is file?", item.isFile(), "is match?", item.name.match("^" + RW_BACKUP + ".*\.zip") != null)
            return item.isFile() && item.name.match("^" + RW_BACKUP + ".+\\.zip") != null
        })
        const sortedArchives = archiveItems.sort((a, b) => a.name.localeCompare(b.name))
        return sortedArchives;
    }

    async function saveWallet() {
        console.log("Save wallet")

        // require the module
        const RNFS = require('react-native-fs');

        const zipPath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP + '.zip';
        const sourcePath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP;

        if (await RNFS.exists(zipPath)) {
            console.log("Previous backup zip exists", zipPath)
            const archivePath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP + Date.now() + '.zip';
            console.log("Archiving backup zip at", archivePath)
            await RNFS.moveFile(zipPath, archivePath)
            console.log("Created archiving backup zip ", archivePath)
        }

        if (await RNFS.exists(sourcePath)) {
            const dirItems: ReadDirItem[] = await RNFS.readDir(sourcePath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined
            console.log("We need to clear files from backup dir", dirItems)
            for (const dirItem of dirItems) {
                console.log('Deleting file', dirItem);
                await RNFS.unlink(sourcePath + dirItem)
            }
        } else {
            console.log("Creating backup dir at", sourcePath)
            await RNFS.mkdir(sourcePath)
        }

        //cleanup archived zips
        console.log("Cleaning archived backup dirs in", RNFS.DocumentDirectoryPath)
        console.log("Pruning archived zips if there are more than 5", archives)
        for (const archiveItem of archives) {
            const count = archives.indexOf(archiveItem);
            if ((archives.length - count) > 5) {
                await RNFS.unlink(archiveItem.path)
                console.log("Deleted archived backup ", archiveItem.path)
            } else {
                console.log("Keeping archived backup ", archiveItem.path)
            }
        }

// write the file
        var output = 'Lorem ipsum dolor sit amet'.repeat(Math.floor(Math.random() * 10))
        console.log("writing output", output)
        await RNFS.writeFile(zipPath, output, 'utf8')
        console.log('FILE WRITTEN ', zipPath);

        console.log("Marking wallet for backup")
        CustomBackup.backup()
        await refreshItems()
    }

    function getTitle(item: ReadDirItem) {
        return "wallet "
            + item.mtime.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
            + " "
            + item.mtime.toLocaleTimeString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
    }

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

                <ScrollView style={styles.scrollableModal} persistentScrollbar={true}>

                    <FlatList
                        inverted={true}
                        data={archives}
                        extraData={refresh}
                        ItemSeparatorComponent={() => <Divider/>}
                        renderItem={({item}) => (
                            <List.Item
                                title={getTitle(item)}
                                titleNumberOfLines={1}
                                titleStyle={styles.clickableListArchive}
                                descriptionStyle={styles.listDescription}
                                descriptionNumberOfLines={1}
                                onPress={() => refreshItems(item)}
                            />
                        )}
                    />
                </ScrollView>
            </Animated.View>
        </View>
    );
}
