package de.ruegnerlukas.strategygame.backend.gamesession.external.message.handler

import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.Message
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.SubmitTurnMessage
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnSubmit
import de.ruegnerlukas.strategygame.backend.common.logging.Logging

/**
 * Message-dispatcher for websocket messages
 */
class MessageHandler(
    private val turnSubmitAction: TurnSubmit
) : Logging {

    /**
     * Called for any incoming message
     * @param message the message
     */
    suspend fun onMessage(message: Message<*>) {
        log().info("Received message '${message.type}' from connection ${message.meta?.connectionId}")
        when (message.type) {
            SubmitTurnMessage.TYPE -> handleSubmitTurn(message as SubmitTurnMessage)
            else -> log().info("Unknown message type: ${message.type}")
        }
    }

    private suspend fun handleSubmitTurn(message: SubmitTurnMessage) {
        turnSubmitAction.perform(message.meta!!.userId, message.meta!!.gameId, message.payload.commands.map { it.asCommandData() })
    }

}