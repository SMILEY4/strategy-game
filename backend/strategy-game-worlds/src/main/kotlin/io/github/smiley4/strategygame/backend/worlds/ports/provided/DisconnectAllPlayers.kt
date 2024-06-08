package io.github.smiley4.strategygame.backend.worlds.ports.provided

/**
 * Disconnect all currently connected players
 */
interface DisconnectAllPlayers {
	suspend fun perform()
}