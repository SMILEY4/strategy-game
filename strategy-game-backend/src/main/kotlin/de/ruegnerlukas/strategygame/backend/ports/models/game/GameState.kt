package de.ruegnerlukas.strategygame.backend.ports.models.game

data class GameState(
	val gameId: String,
	val map: Tilemap,
	var markers: List<Marker>,
	val participants: List<GameParticipant>,
)



