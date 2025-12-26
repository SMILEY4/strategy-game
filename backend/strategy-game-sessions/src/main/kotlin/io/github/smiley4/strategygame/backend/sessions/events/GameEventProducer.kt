package io.github.smiley4.strategygame.backend.sessions.events

import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.events.models.GameEventConnection
import io.github.smiley4.strategygame.backend.sessions.events.models.GameEventServerMessage


class GameEventProducer(private val gameEventsContext: WebSocketContext<GameEventConnection, GameEventServerMessage>) {

    suspend fun sendGameState(gameId: Game.Id, gameStateBuilder: (userId: User.Id) -> JsonType) {
        gameEventsContext
            .connections()
            .filter { it.principal.gameId == gameId }
            .send { connection -> GameEventServerMessage.GameState.from(gameStateBuilder(connection.principal.userId)) }
    }

    suspend fun sendGameState(connection: GameEventConnection, gameState: JsonType) {
        gameEventsContext
            .only(connection)
            .send(GameEventServerMessage.GameState.from(gameState))
    }

}