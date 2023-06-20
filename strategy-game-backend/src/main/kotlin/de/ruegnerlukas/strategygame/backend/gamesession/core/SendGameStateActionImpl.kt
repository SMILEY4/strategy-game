package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.producer.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.SendGameStateAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.SendGameStateAction.SendGameStateActionError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.SendGameStateAction.UserNotConnectedError

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
        return game.game.players.findByUserId(userId)?.connectionId?.ok()
            ?: UserNotConnectedError.err()
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