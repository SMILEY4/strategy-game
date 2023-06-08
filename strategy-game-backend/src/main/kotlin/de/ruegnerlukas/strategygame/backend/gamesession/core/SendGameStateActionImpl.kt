package de.ruegnerlukas.strategygame.backend.gameengine.core.sendstate

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.common.GameConfig
import de.ruegnerlukas.strategygame.backend.common.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.sendstate.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.sendstate.SendGameStateAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.sendstate.SendGameStateAction.SendGameStateActionError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.sendstate.SendGameStateAction.UserNotConnectedError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExtendedQuery

class SendGameStateActionImpl(
    private val gameConfig: GameConfig,
    private val gameExtendedQuery: GameExtendedQuery,
    private val messageProducer: GameMessageProducer,
) : SendGameStateAction, Logging {

    private val metricId = metricCoreAction(SendGameStateAction::class)

    override suspend fun perform(gameId: String, userId: String): Either<SendGameStateActionError, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("Sending game-state of game $gameId to connected player(s)")
            either {
                val game = findGame(gameId).bind()
                val connectionId = getConnectionId(game, userId).bind()
                val gameDto = convertToDTO(userId, game)
                sendGameStateMessage(connectionId, gameDto)
            }
        }
    }

    override suspend fun perform(game: GameExtended, userId: String): Either<SendGameStateActionError, Unit> {
        log().info("Sending game-state of game ${game.game.gameId} to connected player(s)")
        return either {
            val connectionId = getConnectionId(game, userId).bind()
            val gameDto = convertToDTO(userId, game)
            sendGameStateMessage(connectionId, gameDto)
        }
    }


    /**
     * Find and return the game or a [GameNotFoundError] if a game with that id does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameExtended> {
        return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * get connection id of player or null
     */
    private fun getConnectionId(game: GameExtended, userId: String): Either<UserNotConnectedError, Long> {
        return game.game.players.findByUserId(userId)?.connectionId?.right() ?: UserNotConnectedError.left()
    }


    /**
     * Convert the given game to a dto specific for the given player
     */
    private fun convertToDTO(userId: String, game: GameExtended): GameExtendedDTO {
        return GameExtendedDTOCreator(gameConfig).create(userId, game)
    }


    /**
     * Send the new game-state to the connected player
     */
    private suspend fun sendGameStateMessage(connectionId: Long, game: GameExtendedDTO) {
        messageProducer.sendGamedState(connectionId, game)
    }

}