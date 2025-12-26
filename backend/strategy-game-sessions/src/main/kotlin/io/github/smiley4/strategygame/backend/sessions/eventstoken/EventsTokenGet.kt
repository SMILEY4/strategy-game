package io.github.smiley4.strategygame.backend.sessions.eventstoken

import io.github.smiley4.strategygame.backend.common.auth.WebSocketTokenManager
import io.github.smiley4.strategygame.backend.common.auth.WsTokenPrincipal
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import kotlin.time.Duration.Companion.seconds

class EventsTokenGet(
    private val gameDbQuery: GameDbQuery,
    private val tokenManager: WebSocketTokenManager
) {

    suspend fun generate(userId: User.Id, gameId: Game.Id): String {

        val game = try {
            gameDbQuery.query(gameId)
        } catch (e: DocumentNotFoundError) {
            throw EventsTokenGetError.GameNotFoundError(e)
        }

        if(game.players.none { it.user == userId }) {
            throw EventsTokenGetError.NotParticipantError()
        }

        return tokenManager.generate(10.seconds, userId, gameId)
    }

}