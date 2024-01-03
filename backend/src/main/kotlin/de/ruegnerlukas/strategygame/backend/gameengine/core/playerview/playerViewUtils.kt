package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.jsondsl.obj

fun objHidden(visible: Boolean, value: () -> Any?) = obj {
    "visible" to visible
    if (visible) {
        "value" to value()
    } else {
        "value" to null
    }
}
