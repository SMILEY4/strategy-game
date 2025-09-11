package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.obj


internal fun hidden(visible: Boolean, value: () -> Any?) = obj {
    "visible" to visible
    if (visible) {
        "value" to value()
    } else {
        "value" to null
    }
}
