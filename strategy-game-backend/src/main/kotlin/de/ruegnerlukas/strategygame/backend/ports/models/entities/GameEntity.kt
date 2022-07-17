package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class GameEntity(
	val id: String,
	val turn: Int,
	val worldId: String,
)