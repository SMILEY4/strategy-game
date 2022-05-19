package de.ruegnerlukas.strategygame.backend.ports.models.messages

import kotlinx.serialization.Serializable


@Serializable
data class SubmitTurnMessage(
	val worldId: String,
	val commands: List<PlaceMarkerCommand>
)


@Serializable
data class PlaceMarkerCommand(
	val q: Int,
	val r: Int
)