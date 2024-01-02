package de.ruegnerlukas.strategygame.backend.common.jsondsl

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor


fun main() {

    val json = obj {
        "nested" to obj {
            "flag" to false
        }
        "items" to listOf(1, 2, 3, 4).map {
            obj {

            }
        }
        "values" to array(listOf(1, 2, "hello", false, null, obj { "key" to "value" }))
        "field" to 42
        "nothing" to null
    }

    println(json.toJsonString())
    println(json.toPrettyJsonString())

}


fun obj(block: JsonObjectBlock.() -> Unit) = JsonObjectBlock().apply(block).type

fun <T> objOptional(value: T?, block: JsonObjectBlock.(value: T) -> Unit): JsonType {
    return if(value == null) {
        NullType()
    } else {
        JsonObjectBlock().apply { this.block(value) }.type
    }
}

fun objConditional(condition: Boolean, block: JsonObjectBlock.() -> Unit): JsonType {
    return if(condition) {
        obj(block)
    } else {
        NullType()
    }
}

fun array(values: Collection<Any?>) = JsonArrayBlock().apply { add(values) }.type

fun array(vararg values: Any?) = array(values.toList())

fun <T> arrayMapped(values: Collection<T>, block: (value: T) -> Any?) = array(values.map(block))


class JsonObjectBlock(val type: ObjectType = ObjectType()) {

    infix fun String.to(value: JsonType) {
        type.properties[this] = value
    }

    infix fun String.to(value: Number) {
        type.properties[this] = NumberType(value)
    }

    infix fun String.to(value: String) {
        type.properties[this] = TextType(value)
    }

    infix fun String.to(value: Boolean) {
        type.properties[this] = BooleanType(value)
    }

    infix fun <T> String.to(array: Collection<T>) {
        type.properties[this] = ArrayType().apply {
            array.forEach {
                items.add(JsonType.from(it))
            }
        }
    }

    infix fun String.to(value: RGBColor) {
        type.properties[this] = ColorType(value)
    }

    infix fun String.to(value: Any?) {
        type.properties[this] = JsonType.from(value)
    }

}

class JsonArrayBlock(val type: ArrayType = ArrayType()) {

    fun add(values: Collection<Any?>) {
        type.items.addAll(values.map { JsonType.from(it) })
    }

}
