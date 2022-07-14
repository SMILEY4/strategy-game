package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class GameEntity(
	val id: String,
	val seed: Int,
	val turn: Int
)