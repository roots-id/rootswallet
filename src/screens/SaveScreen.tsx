import React, {useEffect, useState} from 'react';
import {
    Alert,
    Animated,
    Pressable,
    View, NativeModules, FlatList, ScrollView, Text,
} from 'react-native';
import RNFS, {ReadDirItem} from "react-native-fs";
import {Colors, Divider, IconButton, RadioButton} from 'react-native-paper';
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
import {displayOrHide, styles} from "../styles/styles";
import {CommonActions, StackActions} from "@react-navigation/routers";
import {getWalletName, loadWalletName} from "../wallet";


const {CustomBackup} = NativeModules;

export default function SaveScreen({route, navigation}: CompositeScreenProps<any, any>) {
    console.log("SaveScreen - params", route.params)

    const MAX_ARCHIVES = 50;

    const {signIn} = React.useContext(AuthContext);
    const {current} = useCardAnimation();
    const RW_BACKUP = "rootswallet_backup";
    const RW_EXPORTED_BACKUP = RW_BACKUP+"_exported";
    const RW_SAVED_BACKUP = RW_BACKUP+"_saved";
    const RW_IMPORTED_BACKUP = RW_BACKUP+"_imported";
    const ZIP_EXTENSION = '.zip';
    const RNFS = require('react-native-fs');
    const defaultStatus = "You can save your current wallet, Import a wallet, Replace your current wallet, or Export a selected wallet"

    const [archives, setArchives] = useState<ReadDirItem[]>([])
    const [picked, setPicked] = React.useState<Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null>()
    const [problem, setProblem] = useState<String>()
    const [refresh, setRefresh] = useState(true)
    const [selection, setSelection] = useState<ReadDirItem>()
    const [status, setStatus] = useState<String>(defaultStatus)

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
            console.warn('SaveScreen - picker cancelled')
            // User cancelled the picker, exit any dialogs or menus and move on
        } else if (isInProgress(err)) {
            console.warn('SaveScreen - multiple pickers were opened, only the last will be considered')
        } else {
            throw err
        }
    }

    async function refreshItems(selectedItem: ReadDirItem | undefined = selection): Promise<boolean> {
        console.log("SaveScreen - toggling refresh")
        const sortedArchives = await getArchiveItems()
        if (sortedArchives && sortedArchives.length > 0) {
            setArchives(sortedArchives)
            console.log("SaveScreen - saved backups size", sortedArchives.length)

            if (selectedItem) {
                console.log("SaveScreen - setting selection to item", selectedItem.name)
                setSelection(selectedItem)
            } else if (sortedArchives && sortedArchives.length > 0) {
                const latest = sortedArchives[0]
                console.log("SaveScreen - setting selection to latest", latest.name)
                setSelection(latest)
            }
            setRefresh(!refresh)
            return true
        } else {
            console.log("SaveScreen - no backups found during refresh")
        }
        return false
    }

    async function addDataAndZip(baseDir: string, output: string): Promise<string> {
        const folder = baseDir + "/" + RW_BACKUP
        const outputPath = folder + "/rootswallet_export.txt"
        console.log("SaveScreen - writing output", output)
        await RNFS.writeFile(outputPath, output, 'utf8')
        console.log('SaveScreen - FILE WRITTEN ', outputPath);

        const zipPath = baseDir + "/" + RW_SAVED_BACKUP + ZIP_EXTENSION
        console.log('SaveScreen - zipping saved rootswallet', zipPath)
        const zipResult = await zip(folder, zipPath)
        console.log("SaveScreen - zip completed", zipResult)

        return zipPath
    }

    async function exportWallet(): Promise<boolean> {
        if (selection) {
            Alert.alert(
                "Exporting to Downloads:",
                "Selected wallet will be exported to Downloads",
                [
                    {
                        text: "Confirm",
                        onPress: async () => {
                            console.log("SaveScreen - export backup", selection.path)
                            updateMessages("Exporting selected wallet, choose directory...")
                            const zipPath = await prepareForNewZip(RNFS.DownloadDirectoryPath,RW_EXPORTED_BACKUP)
                            try {
                                // const pickerResult = await DocumentPicker.pickSingle({
                                //     presentationStyle: 'fullScreen',
                                //     type: DocumentPicker.types.zip,
                                // })
                                // if (pickerResult) {
                                await RNFS.copyFile(selection.path, zipPath)
                                updateMessages("Successfully exported selected wallet to Downloads")
                                //await RNFS.copyFileAssets(selection.path,RNFS.DownloadDirectoryPath+"/rootswallet_export.zip")
                                //CustomBackup.createFile(selection.path)
                                return true
                            } catch (error: any) {
                                handleError(error)
                                updateMessages("Export cancelled", true)
                                return false
                            }
                        }
                    },
                    {
                        text: "Cancel",
                            onPress: () => {
                        console.log("SaveScreen - Export cancelled")
                        updateMessages("Export Cancelled")
                    },
                    style: "cancel"
                    }
                ]
            );
        }
        updateMessages("You must select a wallet to export", true)
        return false
    }

    async function getArchiveItems() {
        console.log("SaveScreen - Getting archived items")
        const dirItems: ReadDirItem[] = await RNFS.readDir(RNFS.DocumentDirectoryPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined
        const archiveItems = dirItems.filter(item => {
            console.log("SaveScreen - is an archive item?", item.name, "is file?", item.isFile(), "is match?", item.name.match("^" + RW_BACKUP + ".*\.zip") != null)
            return item.isFile() && item.name.match("^" + RW_BACKUP + ".*\\.zip") != null
        })
        console.log("SaveScreen - Found archived items:", archiveItems.length)
        const sortedArchives = archiveItems.sort((a, b) => -1 * (a.name.localeCompare(b.name)))
        console.log("SaveScreen - Sorted archived items:", sortedArchives.map(item => item.name))
        return sortedArchives;
    }

    function getDescription(item: ReadDirItem) {
        if (item.mtime) {
            return item.mtime.toLocaleDateString('en-us', {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                })
                + " "
                + item.mtime.toLocaleTimeString('en-us', {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                })
        } else {
            console.error("item has no time element", item)
        }
    }

    function getTitle(item: ReadDirItem) {
        let title = "Imported Wallet"
        if (item.name.endsWith(RW_SAVED_BACKUP+ZIP_EXTENSION)) {
            title = "Saved Wallet"
        }
        console.log("Got title",title)
        return title
    }

    async function importWallet(): Promise<boolean> {
        console.log("SaveScreen - import backup")
        try {
            updateMessages("Select wallet zip to import...")
            const pickerResult = await DocumentPicker.pickSingle({
                presentationStyle: 'fullScreen',
                type: DocumentPicker.types.zip,
            })
            if (pickerResult) {
                console.log("SaveScreen - picker result", pickerResult)
                setPicked([pickerResult])
                console.log("SaveScreen - importing from picked", pickerResult["uri"])
                const zipPath = await prepareForNewZip(RNFS.DocumentDirectoryPath,RW_IMPORTED_BACKUP)
                console.log("SaveScreen - importing to zipPath", zipPath)
                await RNFS.copyFile(pickerResult["uri"], zipPath)
                await signalBackup()
                await refreshItems()
                updateMessages("Successfully imported wallet, it is listed as the Latest wallet")
                return true
            }
        } catch (e) {
            handleError(e)
            updateMessages("Importing wallet cancelled", true)
        }
        console.error("SaveScreen - import failed")
        updateMessages("Failed to import wallet", true)
        return false
    }

    async function initBackupDir(initPath: string): Promise<boolean> {
        if (await RNFS.exists(initPath)) {
            const dirItems: ReadDirItem[] = await RNFS.readDir(initPath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined
            console.log("SaveScreen - We need to clear files from backup dir", dirItems)
            for (const dirItem of dirItems) {
                console.log('SaveScreen - Deleting file', dirItem);
                await RNFS.unlink(dirItem.path)
            }
        } else {
            console.log("SaveScreen - Creating backup dir at", initPath)
            await RNFS.mkdir(initPath)
        }

        return true
    }

    async function loadWallet(): Promise<boolean> {
        console.log("SaveScreen - Load wallet")
        updateMessages("Loading selected wallet...")

        if (selection) {
            Alert.alert(
                "Warning!!!",
                "Your current wallet will be replaced by this backup",
                [
                    {
                        text: "Load",
                        onPress: () => {
                            console.log("SaveScreen - Load accepted")
                            store.clearStorage()
                            const backupPath = RNFS.DocumentDirectoryPath + "/" + RW_BACKUP
                            restoreFromBackup(selection.path, backupPath)
                            resetSession()
                            updateMessages("Load successful, restarting...")
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
                        onPress: () => {
                            console.log("SaveScreen - Load cancelled")
                            updateMessages("Load Cancelled")
                        },
                        style: "cancel"
                    }
                ]
            );
            return true
        } else {
            console.error("SaveScreen - Can't import wallet, nothing selected")
            updateMessages("Load Failed", true)
            return false
        }
    }

    async function prepareForNewZip(dir: string,type: string) {
        const zipPath = dir + "/" + type + ZIP_EXTENSION;

        if (await RNFS.exists(zipPath)) {
            console.log("SaveScreen - Previous backup zip exists", zipPath)
            const archivePath = zipPath.replace(ZIP_EXTENSION,Date.now() + ZIP_EXTENSION);
            console.log("SaveScreen - Archiving backup zip at", archivePath)
            await RNFS.moveFile(zipPath, archivePath)
            console.log("SaveScreen - Created archiving backup zip ", archivePath)
        }

        return zipPath
    }

    async function pruneBackups() : Promise<boolean>{
        console.log("SaveScreen - Pruning archived zips if there are more than", MAX_ARCHIVES, archives)
        for (const archiveItem of archives) {
            const count = archives.indexOf(archiveItem);
            if ((archives.length - count) >= MAX_ARCHIVES) {
                console.log("SaveScreen - Deleting archived backup ", archiveItem.path)
                try {
                    await RNFS.unlink(archiveItem.path)
                    console.log("SaveScreen - Deleted archived backup ", archiveItem.path)
                } catch (error: any) {
                    console.warn("SaveScreen - failed to cleanup backup", error, error.stack)
                }
            } else {
                console.log("SaveScreen - Keeping archived backup ", archiveItem.path)
            }
        }

        return true
    }

    async function restoreFromBackup(zipPath: string, backupPath: string) {
        if (selection && await initBackupDir(backupPath)) {
            console.log("SaveScreen - Reading selection path", zipPath)
            const unzipResult = await unzip(zipPath, backupPath)
            if (unzipResult) {
                const input = await RNFS.readFile(backupPath + "/rootswallet_export.txt", 'utf8')
                console.log("SaveScreen - read input", input)

                const allExports: exportAll = JSON.parse(input)
                if (allExports.exportStorage) {
                    const result = await store.importStorage(allExports.exportStorage)
                    if (result) {
                        if (result.length > 0) {
                            console.error("SaveScreen - Failed to load keys", result)
                        } else {
                            console.log("SaveScreen - Import succeeded", result)
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
        console.info("SaveScreen - resetting session", walName, created)
        const walNameLoaded = await loadWalletName()
        if (walNameLoaded) {
            console.log("AuthStack - wallet found", created)
            signIn(walName, created);
        } else {
            console.error("AuthStack - wallet not found", walNameLoaded)
        }
    }

    async function saveWallet() {
        console.log("SaveScreen - Save wallet")
        updateMessages("Saving current wallet...")

        const backupPath = RNFS.DocumentDirectoryPath + "/" + RW_BACKUP
        if (await initBackupDir(backupPath)) {
            const zipPath = await prepareForNewZip(RNFS.DocumentDirectoryPath,RW_SAVED_BACKUP)
            //cleanup archived zips
            console.log("SaveScreen - Cleaning archived backup dirs in", RNFS.DocumentDirectoryPath)
            if(await pruneBackups()) {

// write the file
                //var output = 'Lorem ipsum dolor sit amet'.repeat(Math.floor(Math.random() * 10))
                const allExports: exportAll = {
                    exportStorage: '',
                    exportWallet: ''
                }
                const storageExport: string | undefined = await store.exportStorage();
                if (storageExport) {
                    allExports.exportStorage = storageExport
                    const output = JSON.stringify(allExports)
                    const zipFile = await addDataAndZip(RNFS.DocumentDirectoryPath, output)
                    if (zipFile && await refreshItems()) {
                        updateMessages("Wallet saved, you can select it below")
                    }
                } else {
                    console.error("SaveScreen - couldn't get storage export")
                }
            }
        }
        await signalBackup()
    }

    async function signalBackup() {
        console.log("SaveScreen - Marking wallet for scheduled backup")
        CustomBackup.backup()
    }

    function updateMessages(msg: string, error: boolean = false) {
        if (error) {
            console.error("SaveScreen - updateMessage error:", msg)
            setStatus("")
            setProblem(msg)
        } else {
            console.log("SaveScreen - updateMessage:", msg)
            setProblem("")
            setStatus(msg)
        }
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
                <View style={[styles.containerRowSpaced,{        marginBottom: 10,}]}>
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

                <Text style={styles.subText}>Status: </Text>
                <View style={[styles.containerRowSpaced,{        marginBottom: 10,}]}>
                    <Text style={[(problem && problem?.length > 0) ? styles.problem : styles.textOrange]}>{((problem && problem?.length > 0) ? problem : status)}</Text>
                </View>

                <Text style={styles.subText}>Saved/Imported Wallets:</Text>
                <View style={[styles.containerRowSpaced,{        marginBottom: 10,}]}>
                <FlatList
                    persistentScrollbar={true}
                    keyExtractor={(item) => item.name}
                    inverted={false}
                    style={styles.scrollableCompact}
                    data={archives}
                    extraData={refresh}
                    ListEmptyComponent={<Text style={[styles.itemHighlighted, {alignContent: "flex-start"}]}>No Saved
                        Wallets</Text>}
                    renderItem={({item}) => (
                        <View style={styles.containerRow}>
                            <RadioButton
                                value={item.path}
                                color="#aa4004"
                                uncheckedColor="#aa4004"
                                onPress={() => refreshItems(item)}
                                status={ (selection && item.name.match(selection.name)) ? 'checked' : 'unchecked' }
                            />
                            <Text style={(selection && item.name.match(selection.name)) ? [styles.itemHighlighted,styles.black] : [styles.clickableListArchive,styles.black]}>{getTitle(item)+"\n"+getDescription(item)}</Text>
                        </View>
                    )}
                />
                </View>
                <View style={styles.containerRowSpaced}>
                    <FormButton
                        title="Replace Current"
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
