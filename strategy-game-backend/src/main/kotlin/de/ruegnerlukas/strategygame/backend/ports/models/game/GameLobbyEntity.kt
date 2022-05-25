package de.ruegnerlukas.strategygame.backend.ports.models.game

import kotlinx.serialization.Serializable


@Serializable
data class GameLobbyEntity(
	val gameId: String,
	val participants: List<PlayerEntity>,
	val world: WorldEntity,
	val commands: List<CommandAddMarkerEntity>
)






