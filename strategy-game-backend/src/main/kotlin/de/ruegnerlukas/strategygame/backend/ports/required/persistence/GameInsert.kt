package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

interface GameInsert {
	suspend fun execute(game: GameEntity, tiles: List<TileEntity>): String
}