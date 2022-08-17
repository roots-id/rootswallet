package com.rootswallet

import android.app.backup.BackupAgent
import android.app.backup.BackupDataInput
import android.app.backup.BackupDataOutput
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.*

class CustomBackupAgent : BackupAgent() {
    /**
     * We put a simple version number into the state files so that we can
     * tell properly how to read "old" versions if at some point we want
     * to change what data we back up and how we store the state blob.
     */
    val AGENT_VERSION = 1

    /**
     * Pick an arbitrary string to use as the "key" under which the
     * data is backed up.  This key identifies different data records
     * within this one application's data set.  Since we only maintain
     * one piece of data we don't need to distinguish, so we just pick
     * some arbitrary tag to use.
     */
    val APP_DATA_KEY = "alldata"

    val DATA_FILE_NAME = "rootswallet_backup.zip";

    /** The app's current data, read from the live disk file  */
//    var mAddMayo = false
//    var mAddTomato = false
//    var mFilling = 0

    /** The location of the application's persistent data file  */
    var mDataFile: File? = null

    /** For convenience, we set up the File object for the app's data on creation  */
    override fun onCreate() {
        Log.d("ROOTS_BACKUP_TAG","onCreate - Backup Agent");
        val fDir = filesDir
        val fileFilter = FileFilter { file ->
            !file.isDirectory && file.name.endsWith(DATA_FILE_NAME)
        }
        val fileItr = fDir.listFiles(fileFilter).iterator()
        while(fileItr.hasNext()) {
            Log.d("ROOTS_BACKUP_TAG","file to backup " + fileItr.next().name);
        }
        Log.d("ROOTS_BACKUP_TAG","onCreate - Looking for saved data at $fDir/$DATA_FILE_NAME");
        mDataFile = File(fDir, DATA_FILE_NAME)
        if(!mDataFile!!.exists()) {
            Log.d("ROOTS_BACKUP_TAG","onCreate - creating new file $fDir, $DATA_FILE_NAME");
            mDataFile!!.createNewFile()
        }
    }

    /**
     * One thing that an application may wish to do is tag the state
     * blob contents with a version number.  This is so that if the
     * application is upgraded, the next time it attempts to do a backup,
     * it can detect that the last backup operation was performed by an
     * older version of the agent, and might therefore require different
     * handling.
     */
    @Throws(IOException::class)
    override fun onBackup(
        oldState: ParcelFileDescriptor?, data: BackupDataOutput,
        newState: ParcelFileDescriptor
    ) {
        Log.d("ROOTS_BACKUP_TAG","onBackup - Backup Agent");
        // First, get the current data from the application's file.  This
        // may throw an IOException, but in that case something has gone
        // badly wrong with the app's data on disk, and we do not want
        // to back up garbage data.  If we just let the exception go, the
        // Backup Manager will handle it and simply skip the current
        // backup operation.
        synchronized(CustomBackupModule.sDataLock) {
            val file = RandomAccessFile(mDataFile, "r")
            Log.d("ROOTS_BACKUP_TAG","onBackup - backup file opened ${mDataFile?.absolutePath}");
//            mFilling = file.readInt()
//            mAddMayo = file.readBoolean()
//            mAddTomato = file.readBoolean()
        }

        // If the new state file descriptor is null, this is the first time
        // a backup is being performed, so we know we have to write the
        // data.  If there <em>is</em> a previous state blob, we want to
        // double check whether the current data is actually different from
        // our last backup, so that we can avoid transmitting redundant
        // data to the storage backend.
        var doBackup = oldState == null
        if (!doBackup) {
            Log.d("ROOTS_BACKUP_TAG","onBackup - comparing state file to determine if we should backup");
            doBackup = compareStateFile(oldState)
        }

        // If we decided that we do in fact need to write our dataset, go
        // ahead and do that.  The way this agent backs up the data is to
        // flatten it into a single buffer, then write that to the backup
        // transport under the single key string.
        if (doBackup) {
            Log.d("ROOTS_BACKUP_TAG","onBackup - doing backup");
            val bufStream = ByteArrayOutputStream()

            // We use a DataOutputStream to write structured data into
            // the buffering stream
            val outWriter = DataOutputStream(bufStream)
            Log.d("ROOTS_BACKUP_TAG","onBackup - writing key/value");
            outWriter.writeUTF(("key"+System.currentTimeMillis()))
            outWriter.writeUTF(("value"+System.currentTimeMillis()))
//            outWriter.writeInt(mFilling)
//            outWriter.writeBoolean(mAddMayo)
//            outWriter.writeBoolean(mAddTomato)

            // Okay, we've flattened the data for transmission.  Pull it
            // out of the buffering stream object and send it off.
            var buffer: ByteArray = bufStream.toByteArray()
            val len = buffer.size
            data.writeEntityHeader(APP_DATA_KEY, len)
            data.writeEntityData(buffer, len)
            Log.d("ROOTS_BACKUP_TAG","onBackup - wrote app data");

            // ***** pathological behavior *****
            // Now, in order to incur deliberate too-much-data failures,
            // try to back up 20 MB of data besides what we already pushed.
//            val MEGABYTE = 1024 * 1024
//            val NUM_MEGS = 20
//            buffer = ByteArray(MEGABYTE)
//            data.writeEntityHeader(HUGE_DATA_KEY, NUM_MEGS * MEGABYTE)
//            for (i in 0 until NUM_MEGS) {
//                data.writeEntityData(buffer, MEGABYTE)
//            }
        }

        // Finally, in all cases, we need to write the new state blob
        Log.w("ROOTS_BACKUP_TAG", "onBackup - wrote state file");
        writeStateFile(newState)
    }

    /**
     * Helper routine - read a previous state file and decide whether to
     * perform a backup based on its contents.
     *
     * @return `true` if the application's data has changed since
     * the last backup operation; `false` otherwise.
     */
    fun compareStateFile(oldState: ParcelFileDescriptor?): Boolean {
        Log.d("ROOTS_BACKUP_TAG","compareStateFile - Backup Agent");
        val instream = FileInputStream(oldState!!.fileDescriptor)
        val `in` = DataInputStream(instream)
        return try {
            val stateVersion: Int = `in`.readInt()
            if (stateVersion > AGENT_VERSION) {
                // Whoops; the last version of the app that backed up
                // data on this device was <em>newer</em> than the current
                // version -- the user has downgraded.  That's problematic.
                // In this implementation, we recover by simply rewriting
                // the backup.
                Log.d("ROOTS_BACKUP_TAG","compareStateFile - stateVersion greater than AGENT_VERSION");
                return true
            }
            Log.d("ROOTS_BACKUP_TAG","compareStateFile - stateVersion less than AGENT_VERSION");
            return true

            // The state data we store is just a mirror of the app's data;
            // read it from the state file then return 'true' if any of
            // it differs from the current data.
//            val lastFilling: Int = `in`.readInt()
//            val lastMayo: Boolean = `in`.readBoolean()
//            val lastTomato: Boolean = `in`.readBoolean()
//            lastFilling != mFilling || lastTomato != mAddTomato || lastMayo != mAddMayo
        } catch (e: IOException) {
            // If something went wrong reading the state file, be safe
            // and back up the data again.
            e.printStackTrace()
            Log.d("ROOTS_BACKUP_TAG","compareStateFile - exception comparing state");
            true
        }
    }

    /**
     * Write out the new state file:  the version number, followed by the
     * three bits of data as we sent them off to the backup transport.
     */
    @Throws(IOException::class)
    fun writeStateFile(stateFile: ParcelFileDescriptor) {
        Log.d("ROOTS_BACKUP_TAG","write State File - Backup Agent");
        val outstream = FileOutputStream(stateFile.fileDescriptor)
        val out = DataOutputStream(outstream)
        out.writeInt(AGENT_VERSION)
        Log.d("ROOTS_BACKUP_TAG","writeSateFile - wrote agent version");
//        out.writeInt(mFilling)
//        out.writeBoolean(mAddMayo)
//        out.writeBoolean(mAddTomato)
    }

    /**
     * This application does not do any "live" restores of its own data,
     * so the only time a restore will happen is when the application is
     * installed.  This means that the activity itself is not going to
     * be running while we change its data out from under it.  That, in
     * turn, means that there is no need to send out any sort of notification
     * of the new data:  we only need to read the data from the stream
     * provided here, build the application's new data file, and then
     * write our new backup state blob that will be consulted at the next
     * backup operation.
     *
     *
     * We don't bother checking the versionCode of the app who originated
     * the data because we have never revised the backup data format.  If
     * we had, the 'appVersionCode' parameter would tell us how we should
     * interpret the data we're about to read.
     */
    @Throws(IOException::class)
    override fun onRestore(
        data: BackupDataInput, appVersionCode: Int,
        newState: ParcelFileDescriptor
    ) {
        Log.d("ROOTS_BACKUP_TAG","onRestore - Backup Agent");
        // We should only see one entity in the data stream, but the safest
        // way to consume it is using a while() loop
        while (data.readNextHeader()) {
            val key = data.key
            Log.d("ROOTS_BACKUP_TAG", "onRestore - read data $key");
            val dataSize = data.dataSize
            if (APP_DATA_KEY == key) {
                // It's our saved data, a flattened chunk of data all in
                // one buffer.  Use some handy structured I/O classes to
                // extract it.
                val dataBuf = ByteArray(dataSize)
                data.readEntityData(dataBuf, 0, dataSize)
                Log.d("ROOTS_BACKUP_TAG", "onRestore - read data entity key ${data.key}");
                val baStream = ByteArrayInputStream(dataBuf)
                val readMe = DataInputStream(baStream)
                var allRead = ""
                while(readMe.available() > 0) {
                    val rMe = readMe.readUTF()
                    Log.d("ROOTS_BACKUP_TAG", "onRestore - read data $rMe");
                    allRead += rMe;
//                mFilling = `in`.readInt()
//                mAddMayo = `in`.readBoolean()
//                mAddTomato = `in`.readBoolean()

                // Now we are ready to construct the app's data file based
                // on the data we are restoring from.
                }
                synchronized(CustomBackupModule.sDataLock) {
                    val file = RandomAccessFile(mDataFile, "rw")
                    file.setLength(0L)
                    file.write(allRead.encodeToByteArray())
                    Log.d("ROOTS_BACKUP_TAG", "onRestore - writing data to new state ${allRead.encodeToByteArray()}");
//                    file.writeInt(mFilling)
//                    file.writeBoolean(mAddMayo)
//                    file.writeBoolean(mAddTomato)
                }
            } else {
                // Curious!  This entity is data under a key we do not
                // understand how to process.  Just skip it.
                Log.w("ROOTS_BACKUP_TAG", "onRestore - skipping backup data");
                data.skipEntityData()
            }
        }

        // The last thing to do is write the state blob that describes the
        // app's data as restored from backup.
        Log.w("ROOTS_BACKUP_TAG", "onRestore - writing state file");
        writeStateFile(newState)
    }

//    private val MY_BACKUP_KEY_ONE: String = "back up value"
//
//    override fun onCreate() {
//        //super.onCreate()
//        Log.d("ROOTS_BACKUP_TAG","onCreate - Backup Agent");
//    }
//
//    override fun onDestroy() {
//        //super.onDestroy()
//        Log.d("ROOTS_BACKUP_TAG","onDestroy - Backup Agent");
//    }
//
//    override fun onBackup(oldState: ParcelFileDescriptor?,
//                          data: BackupDataOutput?, newState: ParcelFileDescriptor?) {
//        Log.d("ROOTS_BACKUP_TAG","onBackup - Backup Agent oldState: $oldState data: $data newState: $newState");
//        if (data != null) {
//            if ((data.transportFlags and
//                        FLAG_CLIENT_SIDE_ENCRYPTION_ENABLED) != 0) {
//                //Even if an attacker had root access to the remote storage provider
//                // they should not be able to decrypt the user's backup data.
//                Log.d("ROOTS_BACKUP_TAG","client side encryption enabled");
//                if(oldState == null) {
//                    Log.d("ROOTS_BACKUP_TAG","no old state is available");
//                } else {
//                    Log.d("ROOTS_BACKUP_TAG","old state is available");
//                    clientSideEncryptedBackup(data)
//                }
//            }
//
//            if ((data.transportFlags and FLAG_DEVICE_TO_DEVICE_TRANSFER) != 0) {
//                Log.d("ROOTS_BACKUP_TAG","local device-to-device transfer enabled");
//            }
//        }
//    }
//
//    override fun onRestore(data: BackupDataInput?, appVersionCode: Int, newState: ParcelFileDescriptor?) {
//        Log.w("ROOTS_BACKUP_TAG", "onRestore int from backup data: $data appVer: $appVersionCode newState: $newState");
//        val info: PackageInfo? = try {
//            packageManager.getPackageInfo(packageName, 0)
//        } catch (e: PackageManager.NameNotFoundException) {
//            null
//        }
//
//        val version: Int = info?.versionCode ?: 0
//
//        printRestore(data!!)
//    }
//
//    override fun onRestore(data: BackupDataInput?, appVersionCode: Long, newState: ParcelFileDescriptor?) {
//        //super.onRestore(data, appVersionCode, newState)
//        Log.w("ROOTS_BACKUP_TAG","onRestore long from backup $data $appVersionCode $newState");
//        printRestore(data!!);
//    }
//
//    override fun onFullBackup(data: FullBackupDataOutput?) {
//        //super.onFullBackup(data)
//        Log.d("ROOTS_BACKUP_TAG","onFullBackup - Backup Agent");
//    }
//
//    override fun onQuotaExceeded(backupDataBytes: Long, quotaBytes: Long) {
//        //super.onQuotaExceeded(backupDataBytes, quotaBytes)
//        Log.e("ROOTS_BACKUP_TAG","onQuotaExceeded - Backup Agent backup $backupDataBytes quota $quotaBytes");
//    }
//
//    override fun onRestoreFile(
//        data: ParcelFileDescriptor?,
//        size: Long,
//        destination: File?,
//        type: Int,
//        mode: Long,
//        mtime: Long
//    ) {
//        //super.onRestoreFile(data, size, destination, type, mode, mtime)
//        Log.w("ROOTS_BACKUP_TAG","onRestoreFile - Backup Agent");
//    }
//
//    override fun onRestoreFinished() {
//        //super.onRestoreFinished()
//        Log.d("ROOTS_BACKUP_TAG","onRestoreFinish - Backup Agent");
//    }
//
//    private fun printRestore(data: BackupDataInput) {
//        Log.d("ROOTS_BACKUP_TAG","printRestore on data sized ${data.dataSize}");
//        while (data.readNextHeader()) {
//            val key: String = data.getKey();
//            val dataSize = data.getDataSize();
//
//            if (key.equals(MY_BACKUP_KEY_ONE)) {
//                // process this kind of record here
//                val buffer: ByteArray = ByteArray(dataSize);
//                data.readEntityData(buffer, 0, dataSize); // reads the entire entity at once
//
//                // now 'buffer' holds the raw data and can be processed however
//                // the agent wishes
//                Log.d("ROOTS_BACKUP_TAG","key is $key - ${buffer.decodeToString()}");
//            }
//        }
//    }
//
//    fun printStateStatus(oldState: ParcelFileDescriptor?, newState: ParcelFileDescriptor?) {
//        Log.d("ROOTS_BACKUP_TAG","printStateStatus");
//        Log.d("ROOTS_BACKUP_TAG","client side encryptedBackup");
//        Log.d("ROOTS_BACKUP_TAG","oldState statSize ${oldState!!.statSize}");
//        Log.d("ROOTS_BACKUP_TAG","oldState  canDetectErrors ${oldState!!.canDetectErrors()}");
//        Log.d("ROOTS_BACKUP_TAG","oldState  fd.valid ${oldState!!.fileDescriptor.valid()}");
//        Log.d("ROOTS_BACKUP_TAG","newState statSize ${newState!!.statSize}");
//        Log.d("ROOTS_BACKUP_TAG","newState  canDetectErrors ${newState!!.canDetectErrors()}");
//        Log.d("ROOTS_BACKUP_TAG","newState  fd.valid ${newState!!.fileDescriptor.valid()}");
//        ParcelFileDescriptor.AutoCloseOutputStream(newState).use { outputStream ->
//            ParcelFileDescriptor.AutoCloseInputStream(oldState).use { inputStream ->
//                val ba: ByteArray = inputStream.readBytes()
//                val str: String = ba.decodeToString()
//                Log.d("ROOTS_BACKUP_TAG", "byteArray from oldState: $str")
//            }
//        }
//    }
//
//    private fun clientSideEncryptedBackup(data: BackupDataOutput) {
//        Log.d("ROOTS_BACKUP_TAG","clientSideEncryptedBackup");
//        val strKey: String = "backupKey"
//        val strVal: String = "backupVal"
//        val ba: ByteArray = strVal.toByteArray()
////        data!!.writeEntityHeader(strKey, ba.size)
////        data.writeEntityData(ba, ba.size)
//        Log.d("ROOTS_BACKUP_TAG", "backing up $strKey = $strVal")
//    }

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
