package de.ruegnerlukas.strategygame.backend.common.utils

import com.lectra.koson.ArrayType
import com.lectra.koson.Koson
import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj

data class JsonDocument(val content: String)

fun buildJson(pretty: Boolean, block: () -> ObjectType): JsonDocument {
    return if (pretty) {
        JsonDocument(block().pretty(3))
    } else {
        JsonDocument(block().toString())
    }
}


fun <T> objMap(value: T?, block: Koson.(value: T) -> Unit): ObjectType? {
    return value?.let { safeValue ->
        obj { block(safeValue) }
    }
}


@Suppress("ClassName")
object arrMap : ArrayType() {
    operator fun <T> get(values: Collection<T>, block: (value: T) -> Unit): ArrayType = arr[values.map { block(it) }]
}

fun main() {

    val value: String? = null

    val json = buildJson(true) {
        obj {
            "everything" to 42
            "value" to objMap(value) {
                "it" to it
            }
        }
    }

    println(json.content)

}
