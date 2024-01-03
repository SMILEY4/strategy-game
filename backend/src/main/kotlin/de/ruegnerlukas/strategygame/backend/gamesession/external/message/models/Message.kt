package de.ruegnerlukas.strategygame.backend.gamesession.external.message.models

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
@JsonSubTypes(
	JsonSubTypes.Type(value = SubmitTurnMessage::class),
	JsonSubTypes.Type(value = GameStateMessage::class),
)
sealed class Message<T>(
	val type: String,
	val payload: T,
	@JsonIgnore var meta: MessageMetadata? = null
) {
	abstract fun encode(): String
}

data class MessageMetadata(
	val connectionId: Long,
	val userId: String,
	val gameId: String,
)
