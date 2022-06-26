package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TileInsertMultiple
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.thenOrErr

/**
 * Create a new game-lobby
 */
class GameLobbyCreateActionImpl(
	private val insertGame: GameInsert,
	private val insertPlayer: PlayerInsert,
	private val insertTiles: TileInsertMultiple
) : GameLobbyCreateAction, Logging {

	/**
	 * @param userId the id of the user creating the game-lobby
	 * @return the id of the game
	 */
	override suspend fun perform(userId: String): Either<String, ApplicationError> {
		log().info("Create new game with owner '$userId'")
		return Either.start()
			.map { createGame() }
			.thenOrErr { game -> insertGame.execute(game) }
			.thenOrErr { game -> insertPlayer.execute(createPlayer(userId, game.id)) }
			.thenOrErr { game -> insertTiles.execute(createTiles(game.id)) }
			.map { game -> game.id }
	}

	private fun createGame() = GameEntity(
		id = UUID.gen(),
		0
	)

	private fun createPlayer(userId: String, gameId: String) = PlayerEntity(
		id = UUID.gen(),
		userId = userId,
		gameId = gameId,
		connectionId = null,
		state = PlayerEntity.STATE_PLAYING
	)

	private fun createTiles(gameId: String) = WorldBuilder().buildTiles().map {
		TileEntity(
			id = UUID.gen(),
			gameId = gameId,
			q = it.q,
			r = it.r
		)
	}

}