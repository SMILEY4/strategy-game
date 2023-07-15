package de.ruegnerlukas.strategygame.backend.common.logging

import com.fasterxml.jackson.databind.ObjectMapper

class LogEntry(objectMapper: ObjectMapper, str: String) {

    private val fields = mutableMapOf<String, String>()

    init {
        objectMapper.readTree(str).fields().forEach {
            fields[it.key] = it.value.asText()
        }
    }

    fun get(field: String) = fields.getOrDefault(field, "")

}