package com.rootswallet

import android.app.backup.BackupManager
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.util.Log
import androidx.core.content.FileProvider
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

// Request code for creating a PDF document.
const val CREATE_FILE = 1

public class CustomBackupModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    /** The various bits of UI that the user can manipulate  */ //    RadioGroup mFillingGroup;
    //    CheckBox mAddMayoCheckbox;
    //    CheckBox mAddTomatoCheckbox;
    //
    //    /** Cache a reference to our persistent data file */
    //    File mDataFile;
    //
    //    /** Also cache a reference to the Backup Manager */
    //    BackupManager mBackupManager;
    //    /** Set up the activity and populate its UI from the persistent data. */
    //    @Override
    //    public void onCreate(Bundle savedInstanceState) {
    //        super.onCreate(savedInstanceState);
    //        Log.d("ROOTS_BACKUP_TAG","onCreate - Backup Activity");
    //        /** Establish the activity's UI */
    //        setContentView(R.layout.backup_restore);
    //
    //        /** Once the UI has been inflated, cache the controls for later */
    //        mFillingGroup = findViewById(R.id.filling_group);
    //        mAddMayoCheckbox = findViewById(R.id.mayo);
    //        mAddTomatoCheckbox = findViewById(R.id.tomato);
    //
    //        /** Set up our file bookkeeping */
    //        mDataFile = new File(getFilesDir(), DATA_FILE_NAME);
    //
    //        /** It is handy to keep a BackupManager cached */
    //        mBackupManager = new BackupManager(this);
    //
    //        /**
    //         * Finally, build the UI from the persistent store
    //         */
    //        populateUI();
    //    }
    //    /**
    //     * Configure the UI based on our persistent data, creating the
    //     * data file and establishing defaults if necessary.
    //     */
    //    void populateUI() {
    //        RandomAccessFile file;
    //
    //        // Default values in case there's no data file yet
    //        int whichFilling = R.id.pastrami;
    //        boolean addMayo = false;
    //        boolean addTomato = false;
    //
    //        /** Hold the data-access lock around access to the file */
    //        synchronized (HugeBackupActivity.sDataLock) {
    //            boolean exists = mDataFile.exists();
    //            try {
    //                file = new RandomAccessFile(mDataFile, "rw");
    //                if (exists) {
    //                    Log.v(TAG, "datafile exists");
    //                    whichFilling = file.readInt();
    //                    addMayo = file.readBoolean();
    //                    addTomato = file.readBoolean();
    //                    Log.v(TAG, "  mayo=" + addMayo
    //                            + " tomato=" + addTomato
    //                            + " filling=" + whichFilling);
    //                } else {
    //                    // The default values were configured above: write them
    //                    // to the newly-created file.
    //                    Log.v(TAG, "creating default datafile");
    //                    writeDataToFileLocked(file,
    //                            addMayo, addTomato, whichFilling);
    //
    //                    // We also need to perform an initial backup; ask for one
    //                    mBackupManager.dataChanged();
    //                }
    //            } catch (IOException ioe) {
    //            }
    //        }
    //
    //        /** Now that we've processed the file, build the UI outside the lock */
    //        mFillingGroup.check(whichFilling);
    //        mAddMayoCheckbox.setChecked(addMayo);
    //        mAddTomatoCheckbox.setChecked(addTomato);
    //
    //        /**
    //         * We also want to record the new state when the user makes changes,
    //         * so install simple observers that do this
    //         */
    //        mFillingGroup.setOnCheckedChangeListener(
    //                new RadioGroup.OnCheckedChangeListener() {
    //                    public void onCheckedChanged(RadioGroup group,
    //                                                 int checkedId) {
    //                        // As with the checkbox listeners, rewrite the
    //                        // entire state file
    //                        Log.v(TAG, "New radio item selected: " + checkedId);
    //                        recordNewUIState();
    //                    }
    //                });
    //
    //        CompoundButton.OnCheckedChangeListener checkListener
    //                = new CompoundButton.OnCheckedChangeListener() {
    //            public void onCheckedChanged(CompoundButton buttonView,
    //                                         boolean isChecked) {
    //                // Whichever one is altered, we rewrite the entire UI state
    //                Log.v(TAG, "Checkbox toggled: " + buttonView);
    //                recordNewUIState();
    //            }
    //        };
    //        mAddMayoCheckbox.setOnCheckedChangeListener(checkListener);
    //        mAddTomatoCheckbox.setOnCheckedChangeListener(checkListener);
    //    }
    /**
     * Backup app data
     */
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun backup(): String {
        Log.d("ROOTS_BACKUP_TAG", "backup() - Backup Module")
        var error = ""
        val bm = BackupManager(reactApplicationContext)
        bm.dataChanged()
//        val cba: CustomBackupAgent = CustomBackupAgent()
//        val stateFile: File = File(cba.filesDir,cba.DATA_FILE_NAME)
//        val oldStateFile: File = File(cba.filesDir,cba.DATA_FILE_NAME+System.currentTimeMillis())
//        stateFile.copyTo(oldStateFile,false)
//        val oldState: ParcelFileDescriptor = ParcelFileDescriptor.open(oldStateFile,MODE_READ_ONLY)
//        val newState: ParcelFileDescriptor = ParcelFileDescriptor.open(oldStateFile, MODE_READ_WRITE)
//        val dataOutput: BackupDataOutput = BackupDataOutput()
//        cba.onBackup(oldState,,newState);
        //val process = Runtime.getRuntime().exec("adb shell bmgr backupnow com.rootswallet")
//        val pb = ProcessBuilder("adb", "shell", "bmgr", "backupnow", "com.rootswallet")
//        val pc = pb.start()
//        pc.waitFor()
//        println("Done")
        return error
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    private fun createFile(filePath: String) : Boolean{
        // video is some file in internal storage
//        val from = File(filePath)
        val to = File(Environment.getExternalStorageDirectory().absolutePath + "/rootswallet_export.zip")
//        from.copyTo(to, true)
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/zip"
            putExtra(Intent.EXTRA_TITLE, "rootswallet_export.zip")

            // Optionally, specify a URI for the directory that should be opened in
            // the system file picker before your app creates the document.
            //putExtra(DocumentsContract.EXTRA_INITIAL_URI,to)
        }

        // Caller
//        val intent = Intent(context, Activity1::class.java)
//        getResult.launch(intent)
//// Receiver
//        private val getResult =
//            registerForActivityResult(
//                ActivityResultContracts.StartActivityForResult()) {
//                if(it.resultCode == Activity.RESULT_OK){
//                    val value = it.data?.getStringExtra("input")
//                }
//            }

//        intent.type = "application/json"
//
//        val uri: Uri = FileProvider.getUriForFile(context, BuildConfig.APPLICATION_ID, fileItem)
//        intent.putExtra(Intent.EXTRA_STREAM, uri)
//
//        context.startActivity(Intent.createChooser(intent, "Exportar arquivo de Log de Auditoria"))
        return true;
    }

//    private var getDataFromFile =
//        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result: ActivityResult ->
//            if (result.resultCode == RESULT_OK) {
//                val uri = result.data?.data
//                val fileContents = readTextFromUri(uri!!)
//                Toast.makeText(this@MainActivity, fileContents, Toast.LENGTH_SHORT).show()
//            }
//        }

    //     * Another helper; this one reads the current UI state and writes that
    //     * to the persistent store, then tells the backup manager that we need
    //     * a backup.
    //     */
    //    void recordNewUIState() {
    //        Log.d("ROOTS_BACKUP_TAG","recordNewUIState - Backup Activity");
    //        boolean addMayo = mAddMayoCheckbox.isChecked();
    //        boolean addTomato = mAddTomatoCheckbox.isChecked();
    //        int whichFilling = mFillingGroup.getCheckedRadioButtonId();
    //        try {
    //            synchronized (CustomBackupModule.sDataLock) {
    //                RandomAccessFile file = new RandomAccessFile(mDataFile, "rw");
    //                writeDataToFileLocked(file, addMayo, addTomato, whichFilling);
    //            }
    //        } catch (IOException e) {
    //            Log.e(TAG, "Unable to record new UI state");
    //        }
    //
    //        mBackupManager.dataChanged();
    //    }
    //
    //    /**
    //     * Click handler, designated in the layout, that runs a restore of the app's
    //     * most recent data when the button is pressed.
    //     */
    //    public void onRestoreButtonClick(View v) {
    //        Log.d("ROOTS_BACKUP_TAG","onRestoreButtonClick - Backup Activity");
    //        Log.v(TAG, "Requesting restore of our most recent data");
    //        mBackupManager.requestRestore(
    //                new RestoreObserver() {
    //                    public void restoreFinished(int error) {
    //                        /** Done with the restore!  Now draw the new state of our data */
    //                        Log.v(TAG, "Restore finished, error = " + error);
    //                        populateUI();
    //                    }
    //                }
    //        );
    //    }
    companion object {
        const val TAG = "ROOTS_BACKUP_ACTIVITY"

        /**
         * We serialize access to our persistent data through a global static
         * object.  This ensures that in the unlikely event of the our backup/restore
         * agent running to perform a backup while our UI is updating the file, the
         * agent will not accidentally read partially-written data.
         *
         *
         * Curious but true: a zero-length array is slightly lighter-weight than
         * merely allocating an Object, and can still be synchronized on.
         */
        val sDataLock = arrayOfNulls<Any>(0)

        /** Also supply a global standard file name for everyone to use  */
        const val DATA_FILE_NAME = "rootswallet_export"
    }

    override fun getName(): String {
        return "CustomBackup"
    }
}
