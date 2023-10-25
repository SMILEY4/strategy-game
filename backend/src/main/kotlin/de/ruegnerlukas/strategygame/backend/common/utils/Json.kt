package de.ruegnerlukas.strategygame.backend.common.utils

import com.fasterxml.jackson.annotation.JsonIgnoreType
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.ObjectWriter
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue

object Json {

	val mapper: ObjectMapper = jacksonObjectMapper()

	private val writer: ObjectWriter = mapper.writerWithDefaultPrettyPrinter()

	private val writerReducedFields = jacksonObjectMapper()
		.setSerializationInclusion(JsonInclude.Include.NON_NULL)
		.also { it.addMixIn(Unit::class.java, MixInForIgnoreType::class.java) }
		.writerWithDefaultPrettyPrinter()

	@JsonIgnoreType
	class MixInForIgnoreType

	fun asString(value: Any, excludeNullsAndUnits: Boolean = false): String {
		return if (excludeNullsAndUnits) {
			writerReducedFields.writeValueAsString(value)
		} else {
			writer.writeValueAsString(value)
		}
	}

	inline fun <reified T> fromString(json: String): T {
		return mapper.readValue(json)
	}

	fun fromStringToMap(json: String): Map<String, Any> {
		return mapper.readValue(json)
	}

}
