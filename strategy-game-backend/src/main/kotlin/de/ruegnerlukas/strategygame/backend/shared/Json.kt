package de.ruegnerlukas.strategygame.backend.shared

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.ObjectWriter
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue

object Json {

    val mapper: ObjectMapper = jacksonObjectMapper()
    private val writer: ObjectWriter = mapper.writerWithDefaultPrettyPrinter()


    fun asString(value: Any): String {
        return writer.writeValueAsString(value)
    }

    inline fun <reified T> fromString(json: String): T {
        return mapper.readValue(json)
    }

}



