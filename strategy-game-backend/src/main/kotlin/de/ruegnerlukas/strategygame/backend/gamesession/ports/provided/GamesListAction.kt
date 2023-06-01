package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided


interface GamesListAction {

	suspend fun perform(userId: String): List<String>

}