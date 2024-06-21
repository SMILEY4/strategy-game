package io.github.smiley4.strategygame.backend.worlds.module.core.provided

/**
 * Disconnect all currently connected players
 */
interface DisconnectAllPlayers {
	suspend fun perform()
}