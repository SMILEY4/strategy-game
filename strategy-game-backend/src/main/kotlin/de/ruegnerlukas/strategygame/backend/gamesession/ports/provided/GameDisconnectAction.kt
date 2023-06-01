package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided


interface GameDisconnectAction {

	suspend fun perform(userId: String)

}