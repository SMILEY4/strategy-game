package de.ruegnerlukas.strategygame.backend.ports.models.messages

import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import kotlinx.serialization.Serializable


@Serializable
data class SubmitTurnMessage(
	val commands: List<PlaceMarkerCommand>
)