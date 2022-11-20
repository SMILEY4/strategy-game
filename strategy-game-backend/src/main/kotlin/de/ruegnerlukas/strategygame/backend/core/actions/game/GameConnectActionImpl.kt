package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction.GameConnectActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction.InvalidPlayerState
import de.ruegnerlukas.strategygame.backend.ports.provided.sendstate.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameConnectActionImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val actionSendGameState: SendGameStateAction,
) : GameConnectAction, Logging {

    private val metricId = metricCoreAction(GameConnectAction::class)

    override suspend fun perform(userId: String, gameId: String, connectionId: Long): Either<GameConnectActionError, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("Connect user $userId ($connectionId) to game $gameId")
            either {
                val game = findGame(gameId).bind()
                setConnection(game, userId, connectionId).bind()
                sendInitialGameStateMessage(gameId, userId)
            }
        }
    }

    /**
     * Find and return the game or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, Game> {
        return gameQuery.execute(gameId).mapLeft { GameNotFoundError }
    }

    /**
     * Write the new connection of the player to the db.
     */
    private suspend fun setConnection(game: Game, userId: String, connectionId: Long): Either<InvalidPlayerState, Unit> {
        val player = game.players.findByUserId(userId)
        if (player != null && player.connectionId == null) {
            player.connectionId = connectionId
            gameUpdate.execute(game)
            return Unit.right()
        } else {
            return InvalidPlayerState.left()
        }
    }

    /**
     * Send the initial game-state to the connected player
     * */
    private suspend fun sendInitialGameStateMessage(gameId: String, userId: String) {
        actionSendGameState.perform(gameId, userId)
            .getOrElse { throw Exception("Could not send state of game $gameId to player $userId") }
    }

}