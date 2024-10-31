package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.playerpov.edge.PlayerViewCreator
import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate


internal class ConnectToGameImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val gameExtendedQuery: GameExtendedQuery,
    private val playerViewCreator: PlayerViewCreator,
    private val producer: GameMessageProducer
) : ConnectToGame, Logging {

    private val metricId = MetricId.action(ConnectToGame::class)


    override suspend fun perform(user: User.Id, game: Game.Id, connectionId: Long) {
        return time(metricId) {
            log().info("Connect user $user ($connectionId) to game $game")
            updateConnectionStatus(game, user, connectionId)
            sendInitialGameStateMessage(game, user, connectionId)
        }
    }

    /**
     * Persist the (new) connection state of the player.
     */
    private suspend fun updateConnectionStatus(gameId: Game.Id, userId: User.Id, connectionId: Long) {
        val game = try {
            gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw ConnectToGame.GameNotFoundError()
        }
        val player = game.players.findByUserId(userId)
        if (player != null && player.connectionId == null) {
            player.connectionId = connectionId
            gameUpdate.execute(game)
        } else {
            throw ConnectToGame.InvalidPlayerState()
        }
    }

    /**
     * Send the initial game-state to the connected player
     * */
    private suspend fun sendInitialGameStateMessage(gameId: Game.Id, userId: User.Id, connectionId: Long) {
        val game = try {
            gameExtendedQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw ConnectToGame.GameNotFoundError(e)
        }
        val view = playerViewCreator.build(userId, game)
        producer.sendGameState(connectionId, view)
    }

}
