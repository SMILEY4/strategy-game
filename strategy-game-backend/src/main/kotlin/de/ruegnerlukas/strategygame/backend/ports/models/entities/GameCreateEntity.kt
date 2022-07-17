package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class GameCreateEntity(
	val id: String,
	val turn: Int,
	val world: WorldCreateEntity
)