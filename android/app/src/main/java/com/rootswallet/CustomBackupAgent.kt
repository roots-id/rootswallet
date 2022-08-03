package com.rootswallet

import android.app.backup.BackupAgent
import android.app.backup.BackupDataInput
import android.app.backup.BackupDataOutput
import android.app.backup.FullBackupDataOutput
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.File

class CustomBackupAgent : BackupAgent() {
    private val MY_BACKUP_KEY_ONE: String = "back up value"

    override fun onCreate() {
        //super.onCreate()
        Log.d("ROOTS_BACKUP_TAG","onCreate - Backup Agent");
    }

    override fun onDestroy() {
        //super.onDestroy()
        Log.d("ROOTS_BACKUP_TAG","onDestroy - Backup Agent");
    }

    override fun onBackup(oldState: ParcelFileDescriptor?,
                          data: BackupDataOutput?, newState: ParcelFileDescriptor?) {
        Log.d("ROOTS_BACKUP_TAG","onBackup - Backup Agent oldState: $oldState data: $data newState: $newState");
        if (data != null) {
            if ((data.transportFlags and
                        FLAG_CLIENT_SIDE_ENCRYPTION_ENABLED) != 0) {
                //Even if an attacker had root access to the remote storage provider
                // they should not be able to decrypt the user's backup data.
                Log.d("ROOTS_BACKUP_TAG","client side encryption enabled");
                if(oldState == null) {
                    Log.d("ROOTS_BACKUP_TAG","no old state is available");
                } else {
                    Log.d("ROOTS_BACKUP_TAG","old state is available");
                    clientSideEncryptedBackup(data)
                }
            }

            if ((data.transportFlags and FLAG_DEVICE_TO_DEVICE_TRANSFER) != 0) {
                Log.d("ROOTS_BACKUP_TAG","local device-to-device transfer enabled");
            }
        }
    }

    override fun onRestore(data: BackupDataInput?, appVersionCode: Int, newState: ParcelFileDescriptor?) {
        Log.d("ROOTS_BACKUP_TAG", "onRestore int from backup data: $data appVer: $appVersionCode newState: $newState");
        val info: PackageInfo? = try {
            packageManager.getPackageInfo(packageName, 0)
        } catch (e: PackageManager.NameNotFoundException) {
            null
        }

        val version: Int = info?.versionCode ?: 0

        printRestore(data!!)
    }

    override fun onRestore(data: BackupDataInput?, appVersionCode: Long, newState: ParcelFileDescriptor?) {
        //super.onRestore(data, appVersionCode, newState)
        Log.d("ROOTS_BACKUP_TAG","onRestore long from backup $data $appVersionCode $newState");
        printRestore(data!!);
    }

    override fun onFullBackup(data: FullBackupDataOutput?) {
        //super.onFullBackup(data)
        Log.d("ROOTS_BACKUP_TAG","onFullBackup - Backup Agent");
    }

    override fun onQuotaExceeded(backupDataBytes: Long, quotaBytes: Long) {
        //super.onQuotaExceeded(backupDataBytes, quotaBytes)
        Log.d("ROOTS_BACKUP_TAG","onQuotaExceeded - Backup Agent backup $backupDataBytes quota $quotaBytes");
    }

    override fun onRestoreFile(
        data: ParcelFileDescriptor?,
        size: Long,
        destination: File?,
        type: Int,
        mode: Long,
        mtime: Long
    ) {
        //super.onRestoreFile(data, size, destination, type, mode, mtime)
        Log.d("ROOTS_BACKUP_TAG","onRestoreFile - Backup Agent");
    }

    override fun onRestoreFinished() {
        //super.onRestoreFinished()
        Log.d("ROOTS_BACKUP_TAG","onRestoreFinish - Backup Agent");
    }

    private fun printRestore(data: BackupDataInput) {
        Log.d("ROOTS_BACKUP_TAG","printRestore on data sized ${data.dataSize}");
        while (data.readNextHeader()) {
            val key: String = data.getKey();
            val dataSize = data.getDataSize();

            if (key.equals(MY_BACKUP_KEY_ONE)) {
                // process this kind of record here
                val buffer: ByteArray = ByteArray(dataSize);
                data.readEntityData(buffer, 0, dataSize); // reads the entire entity at once

                // now 'buffer' holds the raw data and can be processed however
                // the agent wishes
                Log.d("ROOTS_BACKUP_TAG","key is $key - ${buffer.decodeToString()}");
            }
        }
    }

    fun printStateStatus(oldState: ParcelFileDescriptor?, newState: ParcelFileDescriptor?) {
        Log.d("ROOTS_BACKUP_TAG","printStateStatus");
        Log.d("ROOTS_BACKUP_TAG","client side encryptedBackup");
        Log.d("ROOTS_BACKUP_TAG","oldState statSize ${oldState!!.statSize}");
        Log.d("ROOTS_BACKUP_TAG","oldState  canDetectErrors ${oldState!!.canDetectErrors()}");
        Log.d("ROOTS_BACKUP_TAG","oldState  fd.valid ${oldState!!.fileDescriptor.valid()}");
        Log.d("ROOTS_BACKUP_TAG","newState statSize ${newState!!.statSize}");
        Log.d("ROOTS_BACKUP_TAG","newState  canDetectErrors ${newState!!.canDetectErrors()}");
        Log.d("ROOTS_BACKUP_TAG","newState  fd.valid ${newState!!.fileDescriptor.valid()}");
        ParcelFileDescriptor.AutoCloseOutputStream(newState).use { outputStream ->
            ParcelFileDescriptor.AutoCloseInputStream(oldState).use { inputStream ->
                val ba: ByteArray = inputStream.readBytes()
                val str: String = ba.decodeToString()
                Log.d("ROOTS_BACKUP_TAG", "byteArray from oldState: $str")
            }
        }
    }

    private fun clientSideEncryptedBackup(data: BackupDataOutput) {
        Log.d("ROOTS_BACKUP_TAG","clientSideEncryptedBackup");
        val strKey: String = "backupKey"
        val strVal: String = "backupVal"
        val ba: ByteArray = strVal.toByteArray()
//        data!!.writeEntityHeader(strKey, ba.size)
//        data.writeEntityData(ba, ba.size)
        Log.d("ROOTS_BACKUP_TAG", "backing up $strKey = $strVal")
    }

//            val file = packZipFileForBackup(data)
//            try {
//                file?.inputStream()?.use { input ->
//                    input.copyTo(outputStream)
//                }
//
//            } finally {
//                if (file?.exists() == true) {
//                    file.delete()
//                }
//            }
//        }
//    }

//    suspend fun packZipFileForBackup(data: BackupDataOutput?): File? {
//        val stringBytes: ByteArray = mStringToBackUp.getBytes()
//        data!!.writeEntityHeader(MY_STRING_KEY, stringBytes.size)
//        data.writeEntityData(stringBytes, stringBytes.size)
//
//        return withContext(Dispatchers.IO) {
//            val dbFile = context.getDatabasePath("dbName.db") // replace this with your db name
//            val dbParentDirectory = dbFile.parentFile
//            val zipFilePath = context.filesDir.path + "/backup.zip" // create zip file for backup
//            val zipFile = File(zipFilePath)
//
//            val dataDir = context.filesDir.parentFile
//            if (dataDir != null) {
//                val sharedPrefDirectoryPath = dataDir.absolutePath + "/shared_prefs"
//                val encZipFile = ZipFile(zipFile.absolutePath, "password".toCharArray())
//                val zipParameters = ZipParameters()
//                zipParameters.isEncryptFiles = true
//                zipParameters.encryptionMethod = EncryptionMethod.AES
//                encZipFile.addFolder(File(sharedPrefDirectoryPath), zipParameters) // add shared pref directory
//                encZipFile.addFolder(context.filesDir, zipParameters) // add files directory
//                encZipFile.addFolder(dbParentDirectory, zipParameters) // add database directory
//            }
//            return@withContext zipFile
//        }
//    }
}
