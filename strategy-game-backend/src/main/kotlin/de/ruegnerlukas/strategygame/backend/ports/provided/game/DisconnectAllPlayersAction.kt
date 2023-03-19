package de.ruegnerlukas.strategygame.backend.ports.provided.game

/**
 * Disconnect all currently connected players
 */
interface DisconnectAllPlayersAction {

	suspend fun perform()

}