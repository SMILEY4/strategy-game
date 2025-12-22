package io.github.smiley4.strategygame.backend.sessions.connect

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.playerpov.lib.PlayerViewCreator
import io.github.smiley4.strategygame.backend.sessions.events.GameEventProducer

class GameConnect(
    private val gameDbQuery: GameDbQuery,
    private val gameDbStateQuery: GameDbStateQuery,
    private val gameDbUpdate: GameDbUpdate,
    private val playerViewCreator: PlayerViewCreator,
    private val producer: GameEventProducer
) : Logging {

    private val metricId = MetricId.action(GameConnect::class)

    suspend fun request(userId: User.Id, gameId: Game.Id) {
        return time(metricId) {
            log().info("Requesting to connect to game $gameId as user $userId")
            val game = getGame(gameId)
            validate(game, userId)
        }
    }


    /**
     * Validate whether the given user can connect to the given game. Throw if validation failed.
     */
    private fun validate(game: Game, userId: User.Id) {
        val player = game.players.findByUserId(userId)
        if (player == null) {
            throw GameConnectError.NotParticipantError()
        }
        if (player.connectionId != null) {
            throw GameConnectError.AlreadyConnectedError()
        }
    }


    /**
     * Get the game by the given id or throw
     */
    private suspend fun getGame(gameId: Game.Id): Game {
        try {
            return gameDbQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameConnectError.GameNotFoundError(e)
        }
    }


    suspend fun connect(user: User.Id, game: Game.Id, connectionId: Long) {
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
            gameDbQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameConnectError.GameNotFoundError()
        }
        val player = game.players.findByUserId(userId)
        if (player != null && player.connectionId == null) {
            player.connectionId = connectionId
            gameDbUpdate.update(game)
        } else {
            throw GameConnectError.InvalidPlayerState()
        }
    }


    /**
     * Send the initial game-state to the connected player
     * */
    private suspend fun sendInitialGameStateMessage(gameId: Game.Id, userId: User.Id, connectionId: Long) {
        val game = try {
            gameDbStateQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameConnectError.GameNotFoundError(e)
        }
        val view = playerViewCreator.build(userId, game)
        producer.sendGameState(connectionId, view)
    }

}