package de.ruegnerlukas.strategygame.backend.external.api.message.handler

import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message
import de.ruegnerlukas.strategygame.backend.external.api.message.models.SubmitTurnMessage
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.shared.Logging

/**
 * Message-dispatcher for websocket messages
 */
class MessageHandler(
    private val turnSubmitAction: TurnSubmitAction
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