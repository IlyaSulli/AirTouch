package expo.modules.foregroundservice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothGatt
import android.bluetooth.BluetoothGattCallback
import android.bluetooth.BluetoothGattCharacteristic
import android.bluetooth.BluetoothGattDescriptor
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.provider.MediaStore
import android.provider.Settings
import android.util.Log
import android.view.KeyEvent
import org.json.JSONArray
import java.util.UUID

class BleGestureService : Service() {

    companion object {
        const val TAG = "BleGestureService"
        const val CHANNEL_ID = "shortcut_air_ble"
        const val NOTIFICATION_ID = 1001
        const val PREFS_NAME = "ShortcutAirNativeConfig"
        const val KEY_SHORTCUTS = "shortcuts_json"
        const val KEY_DEVICE_ID = "ble_device_id"

        const val ACTION_STOP = "expo.modules.foregroundservice.STOP"

        // Arduino BLE UUIDs
        val SERVICE_UUID: UUID = UUID.fromString("19b10000-e8f2-537e-4f6c-d104768a1214")
        val CHARACTERISTIC_UUID: UUID = UUID.fromString("19b10001-e8f2-537e-4f6c-d104768a1214")
        val CCCD_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

        private const val RECONNECT_DELAY_MS = 3000L
        private const val MAX_RECONNECT_ATTEMPTS = 10

        var isRunning = false
            private set
    }

    private var bluetoothGatt: BluetoothGatt? = null
    private val handler = Handler(Looper.getMainLooper())
    private var reconnectAttempts = 0
    private var deviceId: String? = null

    // ─── Service lifecycle ──────────────────────────────────────────────────

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }

        startForeground(NOTIFICATION_ID, buildNotification("Connecting..."))
        isRunning = true

        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        deviceId = prefs.getString(KEY_DEVICE_ID, null)

        if (deviceId != null) {
            connectToDevice()
        } else {
            Log.w(TAG, "No device ID configured, service idle")
            updateNotification("No device configured")
        }

        return START_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        handler.removeCallbacksAndMessages(null)
        disconnectGatt()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ─── Notification ───────────────────────────────────────────────────────

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Shortcut Air Background",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Keeps BLE gesture listening active"
            setShowBadge(false)
        }
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(channel)
    }

    private fun buildNotification(text: String): Notification {
        // Tap opens the app
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val contentPending = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Stop action
        val stopIntent = Intent(this, BleGestureService::class.java).apply { action = ACTION_STOP }
        val stopPending = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("Shortcut Air")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
            .setOngoing(true)
            .setContentIntent(contentPending)
            .addAction(Notification.Action.Builder(
                null, "Stop", stopPending
            ).build())
            .build()
    }

    private fun updateNotification(text: String) {
        val nm = getSystemService(NotificationManager::class.java)
        nm.notify(NOTIFICATION_ID, buildNotification(text))
    }

    // ─── BLE connection (raw Android API) ───────────────────────────────────

    private fun connectToDevice() {
        val id = deviceId ?: return
        val btManager = getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager ?: return
        val adapter = btManager.adapter ?: return

        if (!adapter.isEnabled) {
            Log.w(TAG, "Bluetooth not enabled")
            updateNotification("Bluetooth is off")
            scheduleReconnect()
            return
        }

        try {
            val device = adapter.getRemoteDevice(id)
            updateNotification("Connecting...")
            bluetoothGatt = device.connectGatt(this, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initiate connection", e)
            scheduleReconnect()
        }
    }

    private fun disconnectGatt() {
        try {
            bluetoothGatt?.close()
        } catch (_: Exception) {}
        bluetoothGatt = null
    }

    private fun scheduleReconnect() {
        reconnectAttempts++
        if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
            Log.w(TAG, "Max reconnect attempts reached")
            updateNotification("Disconnected (max retries)")
            return
        }
        val delay = RECONNECT_DELAY_MS * reconnectAttempts
        Log.d(TAG, "Reconnecting in ${delay}ms (attempt $reconnectAttempts)")
        handler.postDelayed({ connectToDevice() }, delay)
    }

    private val gattCallback = object : BluetoothGattCallback() {
        override fun onConnectionStateChange(gatt: BluetoothGatt, status: Int, newState: Int) {
            when (newState) {
                BluetoothProfile.STATE_CONNECTED -> {
                    Log.d(TAG, "Connected to BLE device")
                    reconnectAttempts = 0
                    updateNotification("Listening for gestures...")
                    gatt.discoverServices()
                }
                BluetoothProfile.STATE_DISCONNECTED -> {
                    Log.d(TAG, "Disconnected from BLE device")
                    updateNotification("Disconnected — reconnecting...")
                    disconnectGatt()
                    scheduleReconnect()
                }
            }
        }

        override fun onServicesDiscovered(gatt: BluetoothGatt, status: Int) {
            if (status != BluetoothGatt.GATT_SUCCESS) {
                Log.w(TAG, "Service discovery failed: $status")
                return
            }
            val service = gatt.getService(SERVICE_UUID)
            if (service == null) {
                Log.w(TAG, "Arduino service not found")
                return
            }
            val characteristic = service.getCharacteristic(CHARACTERISTIC_UUID)
            if (characteristic == null) {
                Log.w(TAG, "Gesture characteristic not found")
                return
            }
            // Enable notifications
            gatt.setCharacteristicNotification(characteristic, true)
            val descriptor = characteristic.getDescriptor(CCCD_UUID)
            if (descriptor != null) {
                descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                gatt.writeDescriptor(descriptor)
            }
        }

        @Deprecated("Deprecated in API 33, but needed for older devices")
        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic
        ) {
            val value = characteristic.value
            if (value != null && value.isNotEmpty()) {
                val gesture = value[0].toInt() and 0xFF
                if (gesture in 1..3) {
                    Log.d(TAG, "Gesture detected: $gesture")
                    handleGesture(gesture)
                    // Emit to JS if bridge is active
                    ForegroundServiceModule.emitGesture(gesture)
                }
            }
        }
    }

    // ─── Action dispatch ────────────────────────────────────────────────────

    private fun handleGesture(gesture: Int) {
        val prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
        val json = prefs.getString(KEY_SHORTCUTS, null) ?: return

        try {
            val shortcuts = JSONArray(json)
            val index = gesture - 1
            if (index < 0 || index >= shortcuts.length()) return

            val shortcut = shortcuts.getJSONObject(index)
            if (!shortcut.optBoolean("isActive", false)) return
            if (shortcut.isNull("action")) return

            val action = shortcut.getJSONObject("action")
            val category = action.optString("category", "")
            val label = action.optString("label", "")

            executeAction(category, label, action.optString("packageName", ""))
        } catch (e: Exception) {
            Log.e(TAG, "Error dispatching gesture $gesture", e)
        }
    }

    private fun executeAction(category: String, label: String, packageName: String) {
        try {
            when (category) {
                "app" -> {
                    if (packageName.isNotEmpty()) {
                        val intent = this.packageManager.getLaunchIntentForPackage(packageName) ?: return
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(intent)
                    }
                }
                "camera" -> {
                    if (label == "Open Camera") {
                        val intent = Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA)
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(intent)
                    }
                    // Other camera actions require AccessibilityService, handled via JS
                }
                "system" -> {
                    when (label) {
                        "Toggle Bluetooth" -> {
                            if (Build.VERSION.SDK_INT < 33) {
                                @Suppress("DEPRECATION")
                                val adapter = BluetoothAdapter.getDefaultAdapter()
                                if (adapter != null) {
                                    @Suppress("DEPRECATION")
                                    if (adapter.isEnabled) adapter.disable() else adapter.enable()
                                }
                            }
                        }
                        "Toggle Do Not Disturb" -> {
                            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                            if (nm.isNotificationPolicyAccessGranted) {
                                val current = nm.currentInterruptionFilter
                                if (current == android.app.NotificationManager.INTERRUPTION_FILTER_ALL) {
                                    nm.setInterruptionFilter(android.app.NotificationManager.INTERRUPTION_FILTER_ALARMS)
                                } else {
                                    nm.setInterruptionFilter(android.app.NotificationManager.INTERRUPTION_FILTER_ALL)
                                }
                            }
                        }
                        // WiFi, Mobile Data, Power Saving, Lock Screen require AccessibilityService
                    }
                }
                "multimedia" -> {
                    val am = getSystemService(Context.AUDIO_SERVICE) as AudioManager
                    when (label) {
                        "Volume Up" -> am.adjustStreamVolume(
                            AudioManager.STREAM_MUSIC, AudioManager.ADJUST_RAISE, AudioManager.FLAG_SHOW_UI
                        )
                        "Volume Down" -> am.adjustStreamVolume(
                            AudioManager.STREAM_MUSIC, AudioManager.ADJUST_LOWER, AudioManager.FLAG_SHOW_UI
                        )
                        "Pause / Play Media" -> {
                            am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE))
                            am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE))
                        }
                        "Next Song" -> {
                            am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_NEXT))
                            am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_NEXT))
                        }
                        "Previous Song" -> {
                            am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_MEDIA_PREVIOUS))
                            am.dispatchMediaKeyEvent(KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_MEDIA_PREVIOUS))
                        }
                    }
                }
                // "interaction" actions require AccessibilityService, only work via JS path
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error executing action $category/$label", e)
        }
    }
}
