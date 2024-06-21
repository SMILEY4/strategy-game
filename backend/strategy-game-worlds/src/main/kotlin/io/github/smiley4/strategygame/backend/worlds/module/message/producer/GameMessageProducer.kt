package io.github.smiley4.strategygame.backend.worlds.module.message.producer

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType


interface GameMessageProducer {

    /**
     * Send the given game-state to the given websocket-connection
     * @param connectionId the id of the websocket connection
     * @param game the game-state to send
     */
    suspend fun sendGamedState(connectionId: Long, game: JsonType)

}