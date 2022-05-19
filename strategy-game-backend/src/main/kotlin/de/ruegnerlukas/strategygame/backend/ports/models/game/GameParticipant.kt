package de.ruegnerlukas.strategygame.backend.ports.models.game

import de.ruegnerlukas.strategygame.backend.external.api.models.PlaceMarkerCommand

data class GameParticipant(
	val userId: String,
	val owner: Boolean,
	var connectionId: Int?,
	var currentCommands: List<PlaceMarkerCommand>?,
) {
	companion object {
		fun owner(userId: String) = GameParticipant(userId, true, null, null)
		fun participant(userId: String) = GameParticipant(userId, false, null, null)
	}
}
