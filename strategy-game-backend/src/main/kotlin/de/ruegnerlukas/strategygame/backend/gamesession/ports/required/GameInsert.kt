package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.Tile

interface GameInsert {
	suspend fun execute(game: Game, tiles: List<Tile>): String
}