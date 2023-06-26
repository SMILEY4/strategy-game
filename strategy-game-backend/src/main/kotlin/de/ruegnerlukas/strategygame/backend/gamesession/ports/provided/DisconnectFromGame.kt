package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided


interface DisconnectFromGame {

	suspend fun perform(userId: String)

}