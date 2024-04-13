package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.GameSessionData


interface ListGames {

	suspend fun perform(userId: String): List<GameSessionData>

}