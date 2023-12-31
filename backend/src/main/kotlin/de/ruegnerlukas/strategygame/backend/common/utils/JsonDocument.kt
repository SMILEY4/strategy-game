package de.ruegnerlukas.strategygame.backend.common.utils

data class JsonDocument(val content: String)

fun buildJson(pretty: Boolean, block: () -> com.lectra.koson.ObjectType): JsonDocument {
    return if(pretty) {
        JsonDocument(block().pretty(3))
    } else {
        JsonDocument(block().toString())
    }
}