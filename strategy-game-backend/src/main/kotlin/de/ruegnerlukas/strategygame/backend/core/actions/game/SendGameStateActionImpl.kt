package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.SendGameStateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.SendGameStateAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.SendGameStateAction.SendGameStateActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.SendGameStateAction.UserNotConnectedError
import de.ruegnerlukas.strategygame.backend.ports.required.GameMessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameExtendedQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class SendGameStateActionImpl(
    private val gameExtendedQuery: GameExtendedQuery,
    private val messageProducer: GameMessageProducer,
) : SendGameStateAction, Logging {

    override suspend fun perform(game: GameExtendedEntity, userId: String): Either<SendGameStateActionError, Unit> {
        log().info("Sending game-state of game ${game.game.getKeyOrThrow()} to connected player(s)")
        return either {
            val connectionId = getConnectionId(game, userId).bind()
            sendGameStateMessage(connectionId, game)
        }
    }

    override suspend fun perform(gameId: String, userId: String): Either<SendGameStateActionError, Unit> {
        log().info("Sending game-state of game $gameId to connected player(s)")
        return either {
            val game = findGame(gameId).bind()
            val connectionId = getConnectionId(game, userId).bind()
            sendGameStateMessage(connectionId, game)
        }
    }


    /**
     * Find and return the game or a [GameNotFoundError] if a game with that id does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameExtendedEntity> {
        return gameExtendedQuery.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * get connection id of player or null
     */
    private fun getConnectionId(game: GameExtendedEntity, userId: String): Either<UserNotConnectedError, Int> {
        return game.game.players
            .filter { it.userId == userId }
            .filter { it.connectionId !== null }
            .map { it.connectionId!! }
            .firstOrNull()?.right()
            ?: UserNotConnectedError.left()
    }


    /**
     * Send the new game-state to the connected player
     */
    private suspend fun sendGameStateMessage(connectionId: Int, game: GameExtendedEntity) {
        messageProducer.sendGamedState(connectionId, game)
    }

}