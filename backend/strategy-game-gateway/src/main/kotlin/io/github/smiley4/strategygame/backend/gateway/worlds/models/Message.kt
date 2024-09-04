package io.github.smiley4.strategygame.backend.gateway.worlds.models

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
internal sealed class Message<T>(
	val type: String,
	val payload: T,
	@JsonIgnore var meta: MessageMetadata? = null
) {
	abstract fun encode(): String
}

internal data class MessageMetadata(
	val connectionId: Long,
	val userId: String,
	val gameId: String,
)
