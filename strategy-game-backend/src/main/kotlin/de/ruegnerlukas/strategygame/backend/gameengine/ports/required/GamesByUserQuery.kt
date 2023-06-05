package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.Game

interface GamesByUserQuery {
	suspend fun execute(userId: String): List<Game>
}