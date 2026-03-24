package expo.modules.accessibilitybridge

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.text.TextUtils
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AccessibilityBridgeModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("AccessibilityBridge")

        AsyncFunction("isAccessibilityServiceEnabled") {
            val context = appContext.reactContext ?: return@AsyncFunction false
            isServiceEnabled(context)
        }

        AsyncFunction("openAccessibilitySettings") {
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }

        AsyncFunction("performSwipe") { direction: String, promise: Promise ->
            val service = ShortcutAirAccessibilityService.instance
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED",
                    "Accessibility service is not enabled. Enable it in Settings > Accessibility.", null)
                return@AsyncFunction
            }
            service.performSwipe(direction) { success ->
                if (success) promise.resolve(null)
                else promise.reject("SWIPE_FAILED", "Swipe gesture was cancelled", null)
            }
        }

        AsyncFunction("lockScreen") {
            val service = ShortcutAirAccessibilityService.instance
                ?: throw Exception("Accessibility service is not enabled")
            if (!service.performLockScreen()) {
                throw Exception("Lock screen requires Android 9+ (API 28)")
            }
        }

        AsyncFunction("toggleQuickSettingsTile") { tileLabels: List<String>, promise: Promise ->
            val service = ShortcutAirAccessibilityService.instance
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED",
                    "Accessibility service is not enabled", null)
                return@AsyncFunction
            }
            if (!service.openQuickSettings()) {
                promise.reject("QS_FAILED", "Failed to open Quick Settings", null)
                return@AsyncFunction
            }
            service.clickQuickSettingsTile(tileLabels) { success ->
                if (success) promise.resolve(null)
                else promise.reject("TILE_NOT_FOUND",
                    "Could not find Quick Settings tile", null)
            }
        }

        AsyncFunction("findAndClickByText") { labels: List<String>, preferUnselected: Boolean, promise: Promise ->
            val service = ShortcutAirAccessibilityService.instance
            if (service == null) {
                promise.reject("SERVICE_NOT_ENABLED",
                    "Accessibility service is not enabled", null)
                return@AsyncFunction
            }
            service.findAndClickByText(labels, preferUnselected) { success ->
                if (success) promise.resolve(null)
                else promise.reject("NOT_FOUND",
                    "Could not find any matching UI element", null)
            }
        }
    }

    private fun isServiceEnabled(context: Context): Boolean {
        val serviceName = ComponentName(context, ShortcutAirAccessibilityService::class.java)
            .flattenToString()
        val enabledServices = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        val colonSplitter = TextUtils.SimpleStringSplitter(':')
        colonSplitter.setString(enabledServices)
        while (colonSplitter.hasNext()) {
            if (colonSplitter.next().equals(serviceName, ignoreCase = true)) {
                return true
            }
        }
        return false
    }
}
