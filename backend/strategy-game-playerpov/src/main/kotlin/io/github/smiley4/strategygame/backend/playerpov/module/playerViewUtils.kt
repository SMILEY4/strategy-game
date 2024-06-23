package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.obj


fun objHidden(visible: Boolean, value: () -> Any?) = obj {
    "visible" to visible
    if (visible) {
        "value" to value()
    } else {
        "value" to null
    }
}
