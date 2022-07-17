package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

interface QueryTiles {
	suspend fun execute(worldId: String): List<TileEntity>
}