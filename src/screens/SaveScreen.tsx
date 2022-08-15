import React, {useEffect, useState} from 'react';
import {
    Alert,
    Animated,
    Pressable,
    View, NativeModules, FlatList, ScrollView, Text,
} from 'react-native';
import RNFS, {ReadDirItem} from "react-native-fs";
import {Divider, IconButton, List} from 'react-native-paper';
import DocumentPicker, {
    DirectoryPickerResponse,
    DocumentPickerResponse,
    isInProgress,
    types,
} from 'react-native-document-picker';
import RNRestart from 'react-native-restart';
import {unzip, zip} from 'react-native-zip-archive'
import {CompositeScreenProps} from "@react-navigation/core/src/types";
import {useCardAnimation} from '@react-navigation/stack';


import FormButton from "../components/FormButton";
import AuthContext from '../context/AuthenticationContext';
import {exportAll, ExportType} from "../models";
import * as store from "../store";
import {styles} from "../styles/styles";
import {CommonActions, StackActions} from "@react-navigation/routers";
import {getWalletName, loadWalletName} from "../wallet";


const {CustomBackup} = NativeModules;

export default function SaveScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("SaveScreen - params", route.params)

    const MAX_ARCHIVES = 4;

    const {signIn} = React.useContext(AuthContext);
    const {current} = useCardAnimation();
    const RW_BACKUP = "rootswallet_backup";
    const RNFS = require('react-native-fs');
    const backupPath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP;

    const [picked, setPicked] = React.useState<
        Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null
        >()
    const [refresh, setRefresh] = useState(true)
    const [archives, setArchives] = useState<ReadDirItem[]>([])
    const [selection, setSelection] = useState<ReadDirItem>()

    useEffect(() => {
        console.log("SaveScreen - use effect")
        const fetchData = async () => {
            await refreshItems()
        }

        // call the function
        fetchData()
    }, [])

    const handleError = (err: unknown) => {
        if (DocumentPicker.isCancel(err)) {
            console.warn('cancelled')
            // User cancelled the picker, exit any dialogs or menus and move on
        } else if (isInProgress(err)) {
            console.warn('multiple pickers were opened, only the last will be considered')
        } else {
            throw err
        }
    }

    async function refreshItems(item?: ReadDirItem) {
        console.log("SaveScreen - toggling refresh")
        const sortedArchives = await getArchiveItems()
        if(sortedArchives && sortedArchives.length > 0) {
            setArchives(sortedArchives)
            console.log("SaveScreen - saved backups size", sortedArchives.length)

            if (item) {
                console.log("SaveScreen - setting selection to item", item.name)
                setSelection(item)
            } else if (sortedArchives && sortedArchives.length > 0) {
                const latest = sortedArchives[0]
                console.log("SaveScreen - setting selection to latest", latest.name)
                setSelection(latest)
            }
        } else {
            console.log("SaveScreen - no backups found during refresh")
        }
        setRefresh(!refresh)
    }

    async function exportWallet() : Promise<boolean> {
        if(selection) {
            console.log("SaveScreen - export backup", selection.path)
            await RNFS.copyFile(selection.path,RNFS.DownloadDirectoryPath+"/rootswallet_export.zip")
            //await RNFS.copyFileAssets(selection.path,RNFS.DownloadDirectoryPath+"/rootswallet_export.zip")
            //CustomBackup.createFile(selection.path)
        }

        //     const perm = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
        //     if (perm.status != 'granted') {
        //         return false;
        //     }
        //     const asset = await MediaLibrary.createAssetAsync(selection.path);
        //     const album = await MediaLibrary.getAlbumAsync('Download');
        //     if (album == null) {
        //         await MediaLibrary.createAlbumAsync('Download', asset, false);
        //     } else {
        //         await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        //     }
        //     return true
        // }
        return false
    }

    async function getArchiveItems() {
        console.log("SaveScreen - Getting archived items")
        const dirItems: ReadDirItem[] = await RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined
        const archiveItems = dirItems.filter(item => {
            console.log("is an archive item?", item.name, "is file?", item.isFile(), "is match?", item.name.match("^" + RW_BACKUP + ".*\.zip") != null)
            return item.isFile() && item.name.match("^" + RW_BACKUP + ".*\\.zip") != null
        })
        console.log("SaveScreen - Found archived items:",archiveItems.length)
        const sortedArchives = archiveItems.sort((a, b) => -1*(a.name.localeCompare(b.name)))
        console.log("SaveScreen - Sorted archived items:",sortedArchives.map(item=>item.name))
        return sortedArchives;
    }

    async function importWallet() : Promise<boolean> {
        console.log("SaveScreen - import backup")
        try {
            const pickerResult = await DocumentPicker.pickSingle({
                presentationStyle: 'fullScreen',
                type: 'application/zip',
            })
            if(pickerResult) {
                console.log("SaveScreen - picker result",pickerResult)
                setPicked([pickerResult])
                console.log("SaveScreen - importing from picked",pickerResult["uri"])
                const zipPath = await prepareForNewZip()
                console.log("SaveScreen - importing to zipPath", zipPath)
                await RNFS.copyFile(pickerResult["uri"], zipPath)
                await signalBackup()
                await refreshItems()
                return true
            }
        } catch (e) {
            handleError(e)
        }
        console.error("SaveScreen - import failed")
        return false
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

    async function loadWallet() : Promise<boolean>{
        console.log("SaveScreen - Load wallet")

        if(selection) {
            Alert.alert(
                "Warning!!!",
                "Your current wallet will be replaced by this backup",
                [
                    {
                        text: "Load",
                        onPress: () => {
                            console.log("SaveScreen - Load accepted")
                            store.clearStorage()
                            restoreFromBackup()
                            resetSession()
                            Alert.alert(
                                "Load Successful",
                                "Restarting RootsWallet",
                                [
                                    {
                                        text: "Restart",
                                        onPress: () => {
                                            // navigation.dispatch(
                                            //     StackActions.popToTop()
                                            // );
                                            // navigation.dispatch(
                                            //     CommonActions.reset({
                                            //         index: 1,
                                            //         routes: [
                                            //             { name: 'Login' },
                                            //         ],
                                            //     })
                                            // );
                                            RNRestart.Restart()
                                        }
                                    },
                                ]
                            );
                        }
                    },
                    {
                        text: "Cancel",
                        onPress: () => console.log("SaveScreen - Load cancelled"),
                        style: "cancel"
                    }
                ]
            );
        } else {
            console.error("Can't import wallet, nothing selected")
        }

        return false
    }

    async function prepareForNewZip() {
        const zipPath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP + '_current.zip';

        if (await RNFS.exists(zipPath)) {
            console.log("Previous backup zip exists", zipPath)
            const archivePath = RNFS.DocumentDirectoryPath + '/' + RW_BACKUP + '_' + Date.now() + '.zip';
            console.log("Archiving backup zip at", archivePath)
            await RNFS.moveFile(zipPath, archivePath)
            console.log("Created archiving backup zip ", archivePath)
        }

        return zipPath
    }

    async function restoreFromBackup() {
        if (selection && await initBackupDir(backupPath)) {
            console.log("SaveScreen - Reading selection path", selection.path)
            const unzipResult = await unzip(selection.path, backupPath)
            if (unzipResult) {
                const input = await RNFS.readFile(backupPath + "/rootswallet_export.txt", 'utf8')
                console.log("SaveScreen - read input", input)

                const allExports: exportAll = JSON.parse(input)
                if (allExports.exportStorage) {
                    const result = await store.importStorage(allExports.exportStorage)
                    if(result) {
                        if(result.length > 0) {
                            console.error("SaveScreen - Failed to load keys",result)
                        } else {
                            console.log("SaveScreen - Import succeeded",result)
                            return true;
                        }
                    } else {
                        console.error("SaveScreen - Import failed", result)
                    }
                } else {
                    console.error("SaveScreen - couldn't load storage")
                }
            }
        }
    }

    async function resetSession() {
        const walName = null
        const created = true
        console.info("SaveScreen - resetting session",walName,created)
        const walNameLoaded = await loadWalletName()
        if(walNameLoaded) {
            console.log("AuthStack - wallet found", created)
            signIn(walName, created);
        } else {
            console.error("AuthStack - wallet not found",walNameLoaded)
        }
    }

    async function saveWallet() {
        console.log("Save wallet")

        const zipPath = await prepareForNewZip()

        if (await initBackupDir(backupPath)) {

            //cleanup archived zips
            console.log("Cleaning archived backup dirs in", RNFS.DocumentDirectoryPath)
            console.log("Pruning archived zips if there are more than", MAX_ARCHIVES, archives)
            for (const archiveItem of archives) {
                const count = archives.indexOf(archiveItem);
                if ((archives.length - count) >= MAX_ARCHIVES) {
                    console.log("Deleting archived backup ", archiveItem.path)
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

            await signalBackup()
            await refreshItems()
        }
    }

    async function signalBackup() {
        console.log("Marking wallet for scheduled backup")
        CustomBackup.backup()
    }

    function getTitle(item: ReadDirItem) {
        if(item.name.endsWith("current.zip")) {
            return "Latest Wallet"
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
            <View style={styles.closeButtonContainer}>
                <IconButton
                    icon="close-circle"
                    size={36}
                    color="#e69138"
                    onPress={() => navigation.goBack()}
                />
            </View>
            <Animated.View
                style={styles.viewAnimated}
            >
                <Text style={styles.subText}>Save/Import Wallet:</Text>
                <View style={styles.containerRowCentered}>
                <FormButton
                    disabled={!(getWalletName())}
                    title="Save Current"
                    modeValue="contained"
                    labelStyle={styles.loginButtonLabel}
                    onPress={async () => saveWallet()}/>
                    <FormButton
                        title="Import"
                        modeValue="contained"
                        labelStyle={styles.loginButtonLabel}
                        onPress={async () => importWallet()}/>
                </View>
                <Text style={styles.subText}></Text>

                <Text style={styles.subText}>Saved/Imported Wallets:</Text>
                <FlatList
                    persistentScrollbar={true}
                    keyExtractor={(item) => item.name}
                    inverted={false}
                    style={styles.scrollableCompact}
                    data={archives}
                    extraData={refresh}
                    ListEmptyComponent={<Text style={[styles.itemHighlighted,{alignContent:"flex-start"}]}>No Saved Wallets</Text>}
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
                <View style={styles.containerRowCentered}>
                    <FormButton
                        title="Load"
                        modeValue="contained"
                        labelStyle={styles.loginButtonLabel}
                        onPress={async () => loadWallet()}/>
                    <FormButton
                        title="Export"
                        modeValue="contained"
                        labelStyle={styles.loginButtonLabel}
                        onPress={async () => exportWallet()}/>
                </View>
            </Animated.View>
        </View>
    );
}
