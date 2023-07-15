package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game

interface GamesByUserQuery {
	suspend fun execute(userId: String): List<Game>
}