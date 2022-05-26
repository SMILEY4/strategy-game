package de.ruegnerlukas.strategygame.backend.ports.models.messages

import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlaceMarkerCommand


data class SubmitTurnMessage(
	val commands: List<PlaceMarkerCommand>
)