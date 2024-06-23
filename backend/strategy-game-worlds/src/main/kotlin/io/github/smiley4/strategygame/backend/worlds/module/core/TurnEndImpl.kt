package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.PlayerState
import io.github.smiley4.strategygame.backend.worlds.edge.TurnEnd
import io.github.smiley4.strategygame.backend.worlds.edge.GameMessageProducer
import io.github.smiley4.strategygame.backend.worlds.module.client.GameStep
import io.github.smiley4.strategygame.backend.worlds.module.persistence.CommandsByGameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate

internal class TurnEndImpl(
    private val commandsByGameQuery: CommandsByGameQuery,
    private val queryGame: GameQuery,
    private val updateGame: GameUpdate,
    private val gameStepAction: GameStep,
    private val producer: GameMessageProducer
) : TurnEnd, Logging {

    private val metricId = MetricId.action(TurnEnd::class)

    override suspend fun perform(gameId: String) {
        return time(metricId) {
            log().info("End turn of game $gameId")
            val gamePre = findGame(gameId)
            val playerViews = stepGame(gamePre)
            val gamePost = findGame(gameId)
            updateGameInfo(gamePost)
            sendGameStateMessages(gamePost, playerViews)
        }
    }


    /**
     * Find and return the [Game] or [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Game {
        try {
            return queryGame.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw TurnEnd.GameNotFoundError()
        }
    }


    /**
     * update the game and world
     */
    private suspend fun stepGame(game: Game): Map<String, JsonType> {
        val commands = commandsByGameQuery.execute(game.gameId, game.turn)
        return gameStepAction.perform(game.gameId, commands, getConnectedUsers(game))
    }


    /**
     * get all userIds of currently connected players of the given game
     */
    private fun getConnectedUsers(game: Game): List<String> {
        return game.players
            .filter { it.connectionId != null }
            .map { it.userId }
    }


    /**
     * Update the state of the game to prepare it for the next turn
     */
    private suspend fun updateGameInfo(game: Game) {
        game.players.forEach { player ->
            player.state = PlayerState.PLAYING
        }
        updateGame.execute(game)
    }


    /**
     * Send the new game-state to the connected players
     */
    private suspend fun sendGameStateMessages(game: Game, playerViews: Map<String, JsonType>) {
        playerViews.forEach { (userId, view) ->
            val connectionId = getConnectionId(game, userId)
            producer.sendGameState(connectionId, view)
        }
    }


    /**
     * get connection id of player or null
     */
    private fun getConnectionId(game: Game, userId: String): Long {
        return game.players.findByUserId(userId)?.connectionId ?: throw Exception("Player is not connected")
    }

}