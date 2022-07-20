package com.rootswallet

import android.app.backup.BackupAgent
import android.app.backup.BackupAgent.FLAG_CLIENT_SIDE_ENCRYPTION_ENABLED
import android.app.backup.BackupDataInput
import android.app.backup.BackupDataOutput
import android.os.ParcelFileDescriptor
import android.util.Log

class CustomBackupAgent : BackupAgent() {
    override fun onBackup(oldState: ParcelFileDescriptor?,
                          data: BackupDataOutput?, newState: ParcelFileDescriptor?) {
        if (data != null) {
            if ((data.transportFlags and
                        FLAG_CLIENT_SIDE_ENCRYPTION_ENABLED) != 0) {
                Log.d("ROOTS_BACKUP_TAG","client side encryption enabled");
            }

            if ((data.transportFlags and FLAG_DEVICE_TO_DEVICE_TRANSFER) != 0) {
                // Local device-to-device transfer is enabled.
            }
        }
    }

    override fun onRestore(data: BackupDataInput?, appVersionCode: Int, newState: ParcelFileDescriptor?) {
        TODO("Not yet implemented")
        Log.d("ROOTS_BACKUP_TAG","restoring from backup");
    }
}
