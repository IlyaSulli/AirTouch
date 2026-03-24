package expo.modules.foregroundservice

import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ForegroundServiceModule : Module() {

    companion object {
        private var moduleInstance: ForegroundServiceModule? = null

        /**
         * Called by BleGestureService when a gesture is detected.
         * Emits an event to JS so the UI can update.
         */
        fun emitGesture(gesture: Int) {
            try {
                moduleInstance?.sendEvent("onGestureDetected", mapOf("gesture" to gesture))
            } catch (_: Exception) {
                // JS bridge may not be active — ignore
            }
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ForegroundService")

        Events("onGestureDetected")

        OnCreate {
            moduleInstance = this@ForegroundServiceModule
        }

        OnDestroy {
            if (moduleInstance == this@ForegroundServiceModule) {
                moduleInstance = null
            }
        }

        AsyncFunction("startService") {
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            val intent = Intent(context, BleGestureService::class.java)
            if (Build.VERSION.SDK_INT >= 26) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        AsyncFunction("stopService") {
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            val intent = Intent(context, BleGestureService::class.java)
            context.stopService(intent)
        }

        AsyncFunction("isServiceRunning") {
            BleGestureService.isRunning
        }

        /**
         * Sync shortcut config and device ID from JS to native SharedPreferences
         * so BleGestureService can read it without the JS bridge.
         */
        AsyncFunction("syncConfig") { shortcutsJson: String, deviceId: String ->
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            context.getSharedPreferences(BleGestureService.PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(BleGestureService.KEY_SHORTCUTS, shortcutsJson)
                .putString(BleGestureService.KEY_DEVICE_ID, deviceId)
                .apply()
        }
    }
}
