package de.ruegnerlukas.strategygame.backend.ports.models.game

import de.ruegnerlukas.strategygame.backend.ports.models.Tilemap

data class GameState(
	val gameId: String,
	val createdTimestamp: Long,
	val participants: List<GameParticipant>,
	val map: Tilemap
)



