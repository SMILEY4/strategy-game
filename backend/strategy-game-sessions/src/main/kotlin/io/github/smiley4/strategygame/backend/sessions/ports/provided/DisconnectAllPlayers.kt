package io.github.smiley4.strategygame.backend.sessions.ports.provided

/**
 * Disconnect all currently connected players
 */
interface DisconnectAllPlayers {
	suspend fun perform()
}