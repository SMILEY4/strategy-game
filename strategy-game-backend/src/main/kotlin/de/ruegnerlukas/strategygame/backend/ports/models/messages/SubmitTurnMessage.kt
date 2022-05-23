package de.ruegnerlukas.strategygame.backend.ports.models.messages

import kotlinx.serialization.Serializable


@Serializable
data class SubmitTurnMessage(
	val commands: List<CommandAddMarker>
)


@Serializable
data class CommandAddMarker(
	val q: Int,
	val r: Int,
)