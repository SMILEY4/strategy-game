package de.ruegnerlukas.strategygame.backend.ports.provided.game


interface GamesListAction {

	suspend fun perform(userId: String): List<String>

}