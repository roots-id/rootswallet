import React, {useEffect, useState} from 'react';
import {
    Animated,
    Pressable,
    View, NativeModules, FlatList, ScrollView, Text,
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
import {unzip, zip} from 'react-native-zip-archive'
import {exportAll, ExportType} from "../models";


export default function SaveScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("save screen - params", route.params)

    const MAX_ARCHIVES = 4;

    const {current} = useCardAnimation();
    const RW_BACKUP = "rootswallet_backup";
    const RNFS = require('react-native-fs');
    const backupPath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP;

    const [refresh, setRefresh] = useState(true)
    const [archives, setArchives] = useState<ReadDirItem[]>([])
    const [selection, setSelection] = useState<ReadDirItem>()

    useEffect(() => {
        console.log("save screen - use effect")
        const fetchData = async () => {
            await refreshItems()
        }

        // call the function
        fetchData()
    }, [])

    async function refreshItems(item?: ReadDirItem) {
        console.log("save screen - toggling refresh")
        const sortedArchives = await getArchiveItems()
        if(sortedArchives && sortedArchives.length > 0) {
            setArchives(sortedArchives)
            console.log("save screen - saved backups size", sortedArchives.length)

            if (item) {
                console.log("save screen - setting selection to item", item.name)
                setSelection(item)
            } else if (sortedArchives && sortedArchives.length > 0) {
                const latest = sortedArchives[sortedArchives.length-1]
                console.log("save screen - setting selection to latest", latest.name)
                setSelection(latest)
            }
        } else {
            console.log("save screen - no backups found during refresh")
        }
        setRefresh(!refresh)
    }

    async function getArchiveItems() {
        console.log("save screen - Getting archived items")
        const dirItems: ReadDirItem[] = await RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined
        const archiveItems = dirItems.filter(item => {
            console.log("is an archive item?", item.name, "is file?", item.isFile(), "is match?", item.name.match("^" + RW_BACKUP + ".*\.zip") != null)
            return item.isFile() && item.name.match("^" + RW_BACKUP + ".*\\.zip") != null
        })
        console.log("save screen - Found archived items:",archiveItems.length)
        const sortedArchives = archiveItems.sort((a, b) => a.name.localeCompare(b.name))
        console.log("save screen - Sorted archived items:",sortedArchives.map(item=>item.name))
        return sortedArchives;
    }

    async function initBackupDir(initPath: string) : Promise<boolean>{
        if (await RNFS.exists(initPath)) {
            const dirItems: ReadDirItem[] = await RNFS.readDir(initPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined
            console.log("We need to clear files from backup dir", dirItems)
            for (const dirItem of dirItems) {
                console.log('Deleting file', dirItem);
                await RNFS.unlink(dirItem.path)
            }
        } else {
            console.log("Creating backup dir at", initPath)
            await RNFS.mkdir(initPath)
        }

        return true
    }

    async function loadWallet() {
        console.log("Save - Load wallet")

        if(selection) {
            // require the module
            if (await initBackupDir(backupPath)) {
                console.log("Reading selection path", selection.path)
                const unzipResult = await unzip(selection.path, backupPath)
                if (unzipResult) {
                    const input = await RNFS.readFile(backupPath + "/rootswallet_export.txt", 'utf8')
                    console.log("read input", input)
                }
            }
        } else {
            console.error("Can't import wallet, nothing selected")
        }
    }

    async function saveWallet() {
        console.log("Save wallet")

        // require the module
        const RNFS = require('react-native-fs');

        const zipPath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP + '_current.zip';

        if (await RNFS.exists(zipPath)) {
            console.log("Previous backup zip exists", zipPath)
            const archivePath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP + '_' + Date.now() + '.zip';
            console.log("Archiving backup zip at", archivePath)
            await RNFS.moveFile(zipPath, archivePath)
            console.log("Created archiving backup zip ", archivePath)
        }

        if (await initBackupDir(backupPath)) {

            //cleanup archived zips
            console.log("Cleaning archived backup dirs in", RNFS.DocumentDirectoryPath)
            console.log("Pruning archived zips if there are more than", MAX_ARCHIVES, archives)
            for (const archiveItem of archives) {
                const count = archives.indexOf(archiveItem);
                if ((archives.length - count) >= MAX_ARCHIVES) {
                    await RNFS.unlink(archiveItem.path)
                    console.log("Deleted archived backup ", archiveItem.path)
                } else {
                    console.log("Keeping archived backup ", archiveItem.path)
                }
            }

// write the file
            //var output = 'Lorem ipsum dolor sit amet'.repeat(Math.floor(Math.random() * 10))
            const allExports: exportAll = {
                exportStorage: '',
                exportWallet: ''
            }
            const storageExport: string | undefined = await store.exportStorage();
            if (storageExport) {
                allExports.exportStorage = storageExport
            } else {
                console.error("SaveScreen - couldn't get storage export")
            }

            const output = JSON.stringify(allExports)
            console.log("SaveScreen - writing output", output)
            const outputPath = backupPath + "/rootswallet_export.txt"
            await RNFS.writeFile(outputPath, output, 'utf8')
            console.log('SaveScreen - FILE WRITTEN ', outputPath);

            console.log('SaveScreen - zipping saved rootswallet')
            const zipResult = await zip(backupPath, zipPath)
            console.log("SaveScreen - zip completed", zipResult)

            console.log("Marking wallet for backup")
            CustomBackup.backup()
            await refreshItems()
        }
    }

    function getTitle(item: ReadDirItem) {
        if(item.name.endsWith("current.zip")) {
            return "Current Wallet"
        } else {
            return "Previous Wallet"
        }
    }

    function getDescription(item: ReadDirItem) {
        return item.mtime.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
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
                <Text style={styles.subText}>Save Current Wallet:</Text>
                <FormButton
                    title="Save Wallet"
                    modeValue="contained"
                    labelStyle={styles.loginButtonLabel}
                    onPress={async () => saveWallet()}/>

                <Text style={styles.subText}></Text>
                <Text style={styles.subText}>Saved Wallets:</Text>
                <FlatList
                    persistentScrollbar={true}
                    keyExtractor={(item) => item.name}
                    inverted={true}
                    style={styles.scrollableCompact}
                    data={archives}
                    extraData={refresh}
                    renderItem={({item}) => (
                        <List.Item
                            title={getTitle(item)}
                            titleNumberOfLines={1}
                            titleStyle={
                                (selection && item.name.match(selection.name)) ? [styles.itemHighlighted] : [styles.clickableListArchive,styles.orange]}
                            description={getDescription(item)}
                            descriptionStyle={styles.descriptionOrange}
                            descriptionNumberOfLines={1}
                            onPress={() => refreshItems(item)}
                        />
                    )}
                />
                <FormButton
                    title="Load Saved"
                    modeValue="contained"
                    labelStyle={styles.loginButtonLabel}
                    onPress={async () => loadWallet()}/>
            </Animated.View>
        </View>
    );
}
