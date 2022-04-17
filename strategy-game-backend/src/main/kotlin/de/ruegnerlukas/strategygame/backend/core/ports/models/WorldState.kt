package de.ruegnerlukas.strategygame.backend.core.ports.models

import kotlinx.serialization.Serializable

@Serializable
data class WorldState(
	val map: Tilemap
)