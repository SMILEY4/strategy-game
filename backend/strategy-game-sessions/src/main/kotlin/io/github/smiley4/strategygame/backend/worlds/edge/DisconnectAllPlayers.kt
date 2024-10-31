package io.github.smiley4.strategygame.backend.worlds.edge

/**
 * Disconnect all currently connected players
 */
interface DisconnectAllPlayers {
	suspend fun perform()
}