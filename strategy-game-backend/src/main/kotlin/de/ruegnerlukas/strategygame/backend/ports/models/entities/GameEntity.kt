package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

data class GameEntity(
	var turn: Int,
	val players: MutableList<PlayerEntity>
) : DbEntity()

data class PlayerEntity(
	val userId: String,
	var connectionId: Int?,
	var state: String
) {
	companion object {
		const val STATE_PLAYING = "playing"
		const val STATE_SUBMITTED = "submitted"
	}
}