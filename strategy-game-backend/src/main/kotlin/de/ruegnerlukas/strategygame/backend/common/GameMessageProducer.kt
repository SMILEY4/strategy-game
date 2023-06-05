package de.ruegnerlukas.strategygame.backend.common

import de.ruegnerlukas.strategygame.backend.common.models.dtos.GameExtendedDTO

interface GameMessageProducer {

    /**
     * Send the given game-state to the given websocket-connection
     * @param connectionId the id of the websocket connection
     * @param game the game-state to send
     */
    suspend fun sendGamedState(connectionId: Long, game: GameExtendedDTO)

}