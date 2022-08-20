package de.ruegnerlukas.strategygame.backend.shared

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.ObjectWriter
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue

object Json {

	val mapper: ObjectMapper = jacksonObjectMapper()
	private val writer: ObjectWriter = mapper.writerWithDefaultPrettyPrinter()
	private val writerWithoutNullFields = jacksonObjectMapper()
		.setSerializationInclusion(JsonInclude.Include.NON_NULL).writerWithDefaultPrettyPrinter()

	fun asString(value: Any, excludeNulls: Boolean = false): String {
		if (excludeNulls) {
			return writerWithoutNullFields.writeValueAsString(value)
		} else {
			return writer.writeValueAsString(value)
		}
	}

	inline fun <reified T> fromString(json: String): T {
		return mapper.readValue(json)
	}

	fun fromStringToMap(json: String): Map<String, Any> {
		return mapper.readValue(json)
	}

}



