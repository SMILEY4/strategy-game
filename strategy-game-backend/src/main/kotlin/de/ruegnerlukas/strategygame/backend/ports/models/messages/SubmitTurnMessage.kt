package de.ruegnerlukas.strategygame.backend.ports.models.messages

import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand


data class SubmitTurnMessage(
	val commands: List<PlaceMarkerCommand>
)