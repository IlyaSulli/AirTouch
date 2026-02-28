package expo.modules.accessibilitybridge

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Point
import android.os.Build
import android.util.DisplayMetrics
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class ShortcutAirAccessibilityService : AccessibilityService() {

    companion object {
        var instance: ShortcutAirAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Not used — we only need the service for dispatching gestures and global actions
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        instance = null
        super.onDestroy()
    }

    // ─── Screen dimensions helper ───────────────────────────────────────────

    private fun getScreenSize(): Point {
        val wm = getSystemService(WINDOW_SERVICE) as WindowManager
        return if (Build.VERSION.SDK_INT >= 30) {
            val bounds = wm.currentWindowMetrics.bounds
            Point(bounds.width(), bounds.height())
        } else {
            val metrics = DisplayMetrics()
            @Suppress("DEPRECATION")
            wm.defaultDisplay.getRealMetrics(metrics)
            Point(metrics.widthPixels, metrics.heightPixels)
        }
    }

    // ─── Swipe gestures ─────────────────────────────────────────────────────

    fun performSwipe(direction: String, callback: ((Boolean) -> Unit)? = null) {
        val screen = getScreenSize()
        val centerX = screen.x / 2f
        val centerY = screen.y / 2f
        val offsetX = screen.x * 0.35f
        val offsetY = screen.y * 0.35f

        val path = Path()
        when (direction) {
            "up" -> {
                path.moveTo(centerX, centerY + offsetY)
                path.lineTo(centerX, centerY - offsetY)
            }
            "down" -> {
                path.moveTo(centerX, centerY - offsetY)
                path.lineTo(centerX, centerY + offsetY)
            }
            "left" -> {
                path.moveTo(centerX + offsetX, centerY)
                path.lineTo(centerX - offsetX, centerY)
            }
            "right" -> {
                path.moveTo(centerX - offsetX, centerY)
                path.lineTo(centerX + offsetX, centerY)
            }
            else -> {
                callback?.invoke(false)
                return
            }
        }

        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 300))
            .build()

        dispatchGesture(gesture, object : GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription?) {
                callback?.invoke(true)
            }
            override fun onCancelled(gestureDescription: GestureDescription?) {
                callback?.invoke(false)
            }
        }, null)
    }

    // ─── Lock screen ────────────────────────────────────────────────────────

    fun performLockScreen(): Boolean {
        return if (Build.VERSION.SDK_INT >= 28) {
            performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)
        } else {
            false
        }
    }

    // ─── Quick Settings tile toggling ───────────────────────────────────────

    fun openQuickSettings(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_QUICK_SETTINGS)
    }

    /**
     * Find and click a Quick Settings tile by searching for text.
     * This is best-effort and may vary across OEM skins.
     */
    fun clickQuickSettingsTile(tileLabels: List<String>, callback: (Boolean) -> Unit) {
        // Delay to let Quick Settings panel fully animate open
        android.os.Handler(mainLooper).postDelayed({
            val root = rootInActiveWindow
            if (root == null) {
                callback(false)
                return@postDelayed
            }
            var found = false
            for (label in tileLabels) {
                val nodes = root.findAccessibilityNodeInfosByText(label)
                if (nodes.isNullOrEmpty()) continue
                for (node in nodes) {
                    if (tryClickNode(node)) {
                        found = true
                        break
                    }
                }
                if (found) break
            }
            root.recycle()

            // Dismiss the notification shade after toggling.
            // Use DISMISS_NOTIFICATION_SHADE on API 31+ to avoid BACK undoing the toggle.
            android.os.Handler(mainLooper).postDelayed({
                if (Build.VERSION.SDK_INT >= 31) {
                    performGlobalAction(GLOBAL_ACTION_DISMISS_NOTIFICATION_SHADE)
                } else {
                    performGlobalAction(GLOBAL_ACTION_BACK)
                    android.os.Handler(mainLooper).postDelayed({
                        performGlobalAction(GLOBAL_ACTION_BACK)
                    }, 250)
                }
            }, 600)

            callback(found)
        }, 900)
    }

    // ─── Generic UI element click by text / content description ─────────────

    /**
     * Find a UI element by text or content description and click it.
     * If [preferUnselected] is true, non-selected nodes are preferred (useful
     * for toggling between tabs like Photo / Video).
     */
    fun findAndClickByText(labels: List<String>, preferUnselected: Boolean, callback: (Boolean) -> Unit) {
        val root = rootInActiveWindow
        if (root == null) {
            callback(false)
            return
        }

        val allNodes = mutableListOf<AccessibilityNodeInfo>()
        for (label in labels) {
            val nodes = root.findAccessibilityNodeInfosByText(label)
            if (!nodes.isNullOrEmpty()) allNodes.addAll(nodes)
        }

        var found = false

        if (preferUnselected) {
            // First pass: try non-selected / non-checked nodes
            for (node in allNodes) {
                if (!node.isSelected && !node.isChecked) {
                    if (tryClickNode(node)) {
                        found = true
                        break
                    }
                }
            }
        }

        // Fallback: try any matching node
        if (!found) {
            for (node in allNodes) {
                if (tryClickNode(node)) {
                    found = true
                    break
                }
            }
        }

        root.recycle()
        callback(found)
    }

    private fun tryClickNode(node: AccessibilityNodeInfo): Boolean {
        if (node.isClickable) {
            return node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        }
        // Walk up the tree to find a clickable parent
        var parent = node.parent
        var depth = 0
        while (parent != null && depth < 5) {
            if (parent.isClickable) {
                val result = parent.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                parent.recycle()
                return result
            }
            val next = parent.parent
            parent.recycle()
            parent = next
            depth++
        }
        parent?.recycle()
        return false
    }

}
