package de.ruegnerlukas.strategygame.backend.ports.models.world

import kotlinx.serialization.Serializable

@Serializable
data class World(
	val tiles: List<Tile>,
)