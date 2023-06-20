package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame.GameConnectActionError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame.InvalidPlayerState
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame.SendStateFailed
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate

class ConnectToGameImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val sendGameState: SendGameStateAction,
) : ConnectToGame, Logging {

    private val metricId = metricCoreAction(ConnectToGame::class)


    override suspend fun perform(userId: String, gameId: String, connectionId: Long): Either<GameConnectActionError, Unit> {

        return Monitoring.coTime(metricId) {
            log().info("Connect user $userId ($connectionId) to game $gameId")
            either {
                val game = findGame(gameId).bind()
                updateConnection(game, userId, connectionId).bind()
                sendInitialGameStateMessage(gameId, userId)
            }
        }
    }


    /**
     * Find and return the game or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, Game> {
        return gameQuery.execute(gameId)
            .mapLeft { GameNotFoundError }
    }


    /**
     * Persist the (new) connection of the player.
     */
    private suspend fun updateConnection(game: Game, userId: String, connectionId: Long): Either<InvalidPlayerState, Unit> {
        val player = game.players.findByUserId(userId)
        return if (player != null && player.connectionId == null) {
            player.connectionId = connectionId
            gameUpdate.execute(game)
            Unit.ok()
        } else {
            InvalidPlayerState.err()
        }
    }


    /**
     * Send the initial game-state to the connected player
     * */
    private suspend fun sendInitialGameStateMessage(gameId: String, userId: String): Either<SendStateFailed, Unit> {
        return sendGameState.perform(gameId, userId)
            .mapLeft { SendStateFailed }
    }

}