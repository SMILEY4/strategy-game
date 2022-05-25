package de.ruegnerlukas.strategygame.backend.ports.models.game

import kotlinx.serialization.Serializable

@Serializable
data class MarkerEntity(
	val userId: String,
	val q: Int,
	val r: Int,
)