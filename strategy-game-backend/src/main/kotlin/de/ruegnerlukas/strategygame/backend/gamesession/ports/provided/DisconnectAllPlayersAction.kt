package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

/**
 * Disconnect all currently connected players
 */
interface DisconnectAllPlayersAction {

	suspend fun perform()

}