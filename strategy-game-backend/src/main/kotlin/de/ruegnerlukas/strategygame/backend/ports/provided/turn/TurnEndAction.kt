package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import de.ruegnerlukas.strategygame.backend.shared.Rail

interface TurnEndAction {

	suspend fun perform(gameId: String): Rail<Unit>

}