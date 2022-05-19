package de.ruegnerlukas.strategygame.backend.ports.models.game

data class GameState(
	val gameId: String,
	val createdTimestamp: Long,
	val participants: List<GameParticipant>,
	val map: Tilemap
)



