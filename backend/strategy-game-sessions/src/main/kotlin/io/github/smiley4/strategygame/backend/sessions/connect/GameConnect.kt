package io.github.smiley4.strategygame.backend.sessions.connect

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.playerpov.lib.PlayerViewCreator
import io.github.smiley4.strategygame.backend.sessions.events.GameEventProducer
import io.github.smiley4.strategygame.backend.sessions.events.models.GameEventConnection

class GameConnect(
    private val gameDbStateQuery: GameDbStateQuery,
    private val playerViewCreator: PlayerViewCreator,
    private val gameEventProducer: GameEventProducer,
) : Logging {

    private val metricId = MetricId.action(GameConnect::class)


    suspend fun connect(user: User.Id, game: Game.Id, connection: GameEventConnection) {
        return time(metricId) {
            log().info("Connect user $user to game $game")
            sendInitialGameStateMessage(game, user, connection)
        }
    }


    /**
     * Send the initial game-state to the connected player
     * */
    private suspend fun sendInitialGameStateMessage(gameId: Game.Id, userId: User.Id, connection: GameEventConnection) {
        val game = try {
            gameDbStateQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameConnectError.GameNotFoundError(e)
        }
        val view = playerViewCreator.build(userId, game)
        gameEventProducer.sendGameState(connection, view)
    }

}