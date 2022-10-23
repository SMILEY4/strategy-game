package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface GameInsert {
	suspend fun execute(game: Game, tiles: List<Tile>): String
}