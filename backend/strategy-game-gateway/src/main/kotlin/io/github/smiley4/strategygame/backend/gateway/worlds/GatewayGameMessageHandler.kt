package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.gateway.worlds.models.Message
import io.github.smiley4.strategygame.backend.gateway.worlds.models.SubmitTurnMessage
import io.github.smiley4.strategygame.backend.worlds.edge.TurnSubmit


/**
 * Message-dispatcher for websocket messages
 */
internal class GatewayGameMessageHandler(
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