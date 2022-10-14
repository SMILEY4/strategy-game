package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.SendGameStateAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.SendGameStateAction.SendGameStateActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.SendGameStateAction.UserNotConnectedError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class SendGameStateActionImpl(
    private val gameConfig: GameConfig,
    private val gameExtendedQuery: GameExtendedQuery,
    private val messageProducer: GameMessageProducer,
) : SendGameStateAction, Logging {

    override suspend fun perform(gameId: String, userId: String): Either<SendGameStateActionError, Unit> {
        log().info("Sending game-state of game $gameId to connected player(s)")
        return either {
            val game = findGame(gameId).bind()
            val connectionId = getConnectionId(game, userId).bind()
            val gameDto = convertToDTO(userId, game)
            sendGameStateMessage(connectionId, gameDto)
        }
    }


    override suspend fun perform(game: GameExtended, userId: String): Either<SendGameStateActionError, Unit> {
        log().info("Sending game-state of game ${game.game.getKeyOrThrow()} to connected player(s)")
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
        return game.game.players
            .filter { it.userId == userId }
            .filter { it.connectionId !== null }
            .map { it.connectionId!! }
            .firstOrNull()?.right()
            ?: UserNotConnectedError.left()
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