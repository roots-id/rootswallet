package com.rootswallet

import android.app.backup.BackupAgent
import android.app.backup.BackupAgent.FLAG_CLIENT_SIDE_ENCRYPTION_ENABLED
import android.app.backup.BackupDataInput
import android.app.backup.BackupDataOutput
import android.app.backup.FullBackupDataOutput
import android.os.ParcelFileDescriptor
import android.util.Log
import java.io.File

class CustomBackupAgent : BackupAgent() {
    override fun onCreate() {
        super.onCreate()
        Log.d("ROOTS_BACKUP_TAG","onCreate - Backup Agent");
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("ROOTS_BACKUP_TAG","onDestroy - Backup Agent");
    }

    override fun onBackup(oldState: ParcelFileDescriptor?,
                          data: BackupDataOutput?, newState: ParcelFileDescriptor?) {
        if (data != null) {
            if ((data.transportFlags and
                        FLAG_CLIENT_SIDE_ENCRYPTION_ENABLED) != 0) {
                TODO("Not yet implemented")
                Log.d("ROOTS_BACKUP_TAG","client side encryption enabled");
            }

            if ((data.transportFlags and FLAG_DEVICE_TO_DEVICE_TRANSFER) != 0) {
                TODO("Not yet implemented")
                Log.d("ROOTS_BACKUP_TAG","local device-to-device transfer enabled");
            }
        }
    }

    override fun onRestore(data: BackupDataInput?, appVersionCode: Int, newState: ParcelFileDescriptor?) {
        TODO("Not yet implemented")
        Log.d("ROOTS_BACKUP_TAG","onRestore int from backup");
    }

    override fun onRestore(data: BackupDataInput?, appVersionCode: Long, newState: ParcelFileDescriptor?) {
        super.onRestore(data, appVersionCode, newState)
        Log.d("ROOTS_BACKUP_TAG","onRestore long from backup");
    }

    override fun onFullBackup(data: FullBackupDataOutput?) {
        super.onFullBackup(data)
        Log.d("ROOTS_BACKUP_TAG","onFullBackup - Backup Agent");
    }

    override fun onQuotaExceeded(backupDataBytes: Long, quotaBytes: Long) {
        super.onQuotaExceeded(backupDataBytes, quotaBytes)
        Log.d("ROOTS_BACKUP_TAG","onQuotaExceeded - Backup Agent");
    }

    override fun onRestoreFile(
        data: ParcelFileDescriptor?,
        size: Long,
        destination: File?,
        type: Int,
        mode: Long,
        mtime: Long
    ) {
        super.onRestoreFile(data, size, destination, type, mode, mtime)
        Log.d("ROOTS_BACKUP_TAG","onRestoreFile - Backup Agent");
    }

    override fun onRestoreFinished() {
        super.onRestoreFinished()
        Log.d("ROOTS_BACKUP_TAG","onRestoreFinish - Backup Agent");
    }
}
