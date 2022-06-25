package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameQuery
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerInsert
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyJoinAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

/**
 * Join an existing game-lobby
 */
class GameLobbyJoinActionImpl(database: Database) : GameLobbyJoinAction, Logging {

	private val queryGame = GameQuery(database)
	private val insertPlayer = PlayerInsert(database)


	override suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError> {
		log().info("Join game-lobby $gameId (user = $userId)")
		return Either.start()
			.flatMap { queryGame.execute(gameId) }
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.flatMap { game -> insertPlayer.execute(createPlayer(game.id, userId)) }
			.discardValue()
	}


	private fun createPlayer(gameId: String, userId: String) = PlayerEntity(
		id = UUID.gen(),
		userId = userId,
		gameId = gameId,
		connectionId = null,
	)

}