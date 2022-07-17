package de.ruegnerlukas.strategygame.backend.ports.models.entities


data class GameExtendedEntity(
	val id: String,
	val turn: Int,
	val world: WorldExtendedEntity,
	val players: List<PlayerEntity>
)