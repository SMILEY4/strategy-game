package de.ruegnerlukas.strategygame.backend.core.ports.models

import kotlinx.serialization.Serializable

/**
 * Represents the map as a collection of [Tile]s
 */
@Serializable
data class Tilemap(
	val tiles: List<Tile>
)
