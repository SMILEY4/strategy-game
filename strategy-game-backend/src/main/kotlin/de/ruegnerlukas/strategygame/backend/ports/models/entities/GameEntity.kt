package de.ruegnerlukas.strategygame.backend.ports.models.entities

import com.arangodb.entity.Key

data class GameEntity(
	@Key val id: String? = null,
	var turn: Int,
	val players: MutableList<PlayerEntity>
)

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