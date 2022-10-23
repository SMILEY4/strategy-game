package de.ruegnerlukas.strategygame.backend.core.actions.sendstate

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.provided.sendstate.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.sendstate.SendGameStateAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.sendstate.SendGameStateAction.SendGameStateActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.sendstate.SendGameStateAction.UserNotConnectedError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

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
    private fun getConnectionId(game: GameExtended, userId: String): Either<UserNotConnectedError, Int> {
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
    private suspend fun sendGameStateMessage(connectionId: Int, game: GameExtendedDTO) {
        messageProducer.sendGamedState(connectionId, game)
    }

}