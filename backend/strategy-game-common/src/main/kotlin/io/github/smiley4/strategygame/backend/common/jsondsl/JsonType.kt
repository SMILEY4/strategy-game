package io.github.smiley4.strategygame.backend.common.jsondsl

import io.github.smiley4.strategygame.backend.common.utils.RGBColor

interface JsonType {

    companion object {

        fun from(value: Any?): JsonType {
            return when (value) {
                null -> NullType()
                is JsonType -> value
                is Number -> NumberType(value)
                is Boolean -> BooleanType(value)
                is String -> TextType(value)
                is RGBColor -> ColorType(value)
                is Enum<*> -> TextType(value.name)
                is Collection<*> -> ArrayType().apply { value.forEach { items.add(from(it)) } }
                else -> UnknownType(value)
            }
        }

    }

    fun toJsonString(config: JsonStringConfig): String

    fun toJsonString(config: (JsonStringConfig.() -> Unit)? = null): String {
        val cfg = config?.let { JsonStringConfig().apply(it) } ?: JsonStringConfig()
        return toJsonString(cfg)
    }

    fun toPrettyJsonString(level: Int = 0, config: JsonStringConfig): String

    fun toPrettyJsonString(config: (JsonStringConfig.() -> Unit)? = null): String {
        val cfg = config?.let { JsonStringConfig().apply(it) } ?: JsonStringConfig()
        return toPrettyJsonString(0, cfg)
    }

}

class JsonStringConfig {
    /**
     * Whether to include spaces e.g. {"key":"value"}  vs { "key": "value" }
     */
    var includeSpaces: Boolean = true


    /**
     * Size of the indentation
     */
    var indentSize: Int = 3


    /**
     * whether to inline objects with one or no properties
     */
    var inlineSimpleObjects: Boolean = false


    /**
     * Whether to include or remove fields with null value (does not affect arrays)
     */
    var includeNullProperties: Boolean = true


    /**
     * Whether to include or remove null items (does not affect objects)
     */
    var includeNullItems: Boolean = true
}


interface PrimitiveJsonType : JsonType

interface BlockJsonType : JsonType

class ObjectType(val properties: MutableMap<String, JsonType> = mutableMapOf()) : BlockJsonType {

    override fun toJsonString(config: JsonStringConfig): String {
        val entries = if (config.includeNullProperties) properties.entries else properties.entries.filter { it.value !is NullType }
        if(entries.isEmpty()) {
            return "{}"
        }
        return if (config.includeSpaces) {
            "{ " + entries.joinToString(", ") { "\"${it.key}\": ${it.value.toJsonString(config)}" } + " }"
        } else {
            "{" + entries.joinToString(",") { "\"${it.key}\":${it.value.toJsonString(config)}" } + "}"
        }
    }

    override fun toPrettyJsonString(level: Int, config: JsonStringConfig): String {
        val entries = if (config.includeNullProperties) properties.entries else properties.entries.filter { it.value !is NullType }
        if(entries.isEmpty()) {
            return "{}"
        }
        if (config.inlineSimpleObjects && entries.size <= 1 && entries.all { it.value is PrimitiveJsonType }) {
            return toJsonString(config)
        }
        val baseIdent = " ".repeat(level * config.indentSize)
        val propIdent = " ".repeat((level + 1) * config.indentSize)
        return entries.joinToString(
            separator = ",${System.lineSeparator()}$propIdent",
            prefix = "{${System.lineSeparator()}$propIdent",
            postfix = "${System.lineSeparator()}$baseIdent}"
        ) { (k, v) -> "\"$k\": ${v.toPrettyJsonString(level + 1, config)}" }
    }

}


class ArrayType(val items: MutableList<JsonType> = mutableListOf()) : BlockJsonType {

    override fun toJsonString(config: JsonStringConfig): String {
        val items = if (config.includeNullItems) this.items else this.items.filter { it !is NullType }
        if(items.isEmpty()) {
            return "[]"
        }
        return if (config.includeSpaces) {
            "[ " + items.joinToString(", ") { it.toJsonString(config) } + " ]"
        } else {
            "[" + items.joinToString(",") { it.toJsonString(config) } + "]"
        }
    }

    override fun toPrettyJsonString(level: Int, config: JsonStringConfig): String {
        val items = if (config.includeNullItems) this.items else this.items.filter { it !is NullType }
        if(items.isEmpty()) {
            return "[]"
        }
        val baseIdent = " ".repeat(level * config.indentSize)
        val propIdent = " ".repeat((level + 1) * config.indentSize)
        return items.joinToString(
            separator = ",${System.lineSeparator()}$propIdent",
            prefix = "[${System.lineSeparator()}$propIdent",
            postfix = "${System.lineSeparator()}$baseIdent]"
        ) { i -> i.toPrettyJsonString(level + 1, config) }
    }
}


class NumberType(val value: Number) : PrimitiveJsonType {
    override fun toJsonString(config: JsonStringConfig) = value.toString()
    override fun toPrettyJsonString(level: Int, config: JsonStringConfig) = toJsonString(config)
}


class TextType(val value: String) : PrimitiveJsonType {
    override fun toJsonString(config: JsonStringConfig) = "\"${value.replace("\"", "\\\"")}\""
    override fun toPrettyJsonString(level: Int, config: JsonStringConfig) = toJsonString(config)
}


class BooleanType(val value: Boolean) : PrimitiveJsonType {
    override fun toJsonString(config: JsonStringConfig) = value.toString()
    override fun toPrettyJsonString(level: Int, config: JsonStringConfig) = toJsonString(config)
}

class ColorType(val value: RGBColor) : PrimitiveJsonType {
    override fun toJsonString(config: JsonStringConfig) = obj {
        "red" to value.red
        "green" to value.green
        "blue" to value.blue
    }.toJsonString(config)

    override fun toPrettyJsonString(level: Int, config: JsonStringConfig) = obj {
        "red" to value.red
        "green" to value.green
        "blue" to value.blue
    }.toPrettyJsonString(level, config)
}

class NullType : PrimitiveJsonType {
    override fun toJsonString(config: JsonStringConfig) = "null"
    override fun toPrettyJsonString(level: Int, config: JsonStringConfig) = toJsonString(config)
}


class UnknownType(val value: Any?) : PrimitiveJsonType {
    override fun toJsonString(config: JsonStringConfig) = throw Exception("Unknown JsonType: ${value?.let { it::class }}")
    override fun toPrettyJsonString(level: Int, config: JsonStringConfig) = toJsonString(config)
}