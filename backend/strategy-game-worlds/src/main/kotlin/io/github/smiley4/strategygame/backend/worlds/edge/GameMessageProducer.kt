package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType

/**
 * Producer for game message
 */
interface GameMessageProducer {
    /**
     * Send the player state the player with the given connection id
     * @param connectionId the id of the open connection
     * @param gameState the state to send
     */
    suspend fun sendGameState(connectionId: Long, gameState: JsonType)
}