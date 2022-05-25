package de.ruegnerlukas.strategygame.backend.ports.models.game

import kotlinx.serialization.Serializable

@Serializable
data class WorldEntity(
	val map: Tilemap,
	val markers: List<MarkerEntity>
)