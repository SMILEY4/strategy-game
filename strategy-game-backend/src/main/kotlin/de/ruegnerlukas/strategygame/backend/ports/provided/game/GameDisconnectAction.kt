package de.ruegnerlukas.strategygame.backend.ports.provided.game


interface GameDisconnectAction {

	suspend fun perform(userId: String)

}