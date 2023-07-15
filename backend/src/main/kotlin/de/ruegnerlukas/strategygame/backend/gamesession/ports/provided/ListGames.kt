package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided


interface ListGames {

	suspend fun perform(userId: String): List<String>

}