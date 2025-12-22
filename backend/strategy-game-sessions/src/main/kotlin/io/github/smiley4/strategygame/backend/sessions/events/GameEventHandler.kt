package io.github.smiley4.strategygame.backend.sessions.events

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.websocket.messages.Message
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameTurnSubmit

internal class GameEventHandler(
    private val gameTurnSubmit: GameTurnSubmit
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
        gameTurnSubmit.submit(
            User.Id(message.meta!!.userId),
            Game.Id(message.meta!!.gameId),
            message.payload.commands.map { it.asCommandData() }
        )
    }

}