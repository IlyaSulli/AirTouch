package expo.modules.shortcutactions

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ShortcutActionsModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("ShortcutActions")

        AsyncFunction("launchApp") { packageName: String ->
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            ActionExecutor.launchApp(context, packageName)
        }

        AsyncFunction("openCamera") {
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            ActionExecutor.openCamera(context)
        }

        AsyncFunction("toggleBluetooth") {
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            ActionExecutor.toggleBluetooth(context)
        }

        AsyncFunction("toggleDoNotDisturb") {
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            ActionExecutor.toggleDoNotDisturb(context)
        }

        AsyncFunction("isDndAccessGranted") Coroutine@{
            val context = appContext.reactContext
                ?: return@Coroutine false
            ActionExecutor.isDndAccessGranted(context)
        }

        AsyncFunction("requestDndAccess") {
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            ActionExecutor.requestDndAccess(context)
        }

        AsyncFunction("adjustVolume") { direction: String ->
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            ActionExecutor.adjustVolume(context, direction)
        }

        AsyncFunction("sendMediaKey") { action: String ->
            val context = appContext.reactContext
                ?: throw Exception("React context is null")
            ActionExecutor.sendMediaKey(context, action)
        }
    }
}
