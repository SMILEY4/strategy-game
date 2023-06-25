package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game

interface GameInsert {
	suspend fun execute(game: Game): String
}