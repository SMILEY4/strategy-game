package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TileInsertMultiple
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID
import java.util.Random

/**
 * Create a new game-lobby
 */
class GameCreateActionImpl(
	private val insertGame: GameInsert,
	private val insertPlayer: PlayerInsert,
	private val insertTiles: TileInsertMultiple
) : GameCreateAction, Logging {

	/**
	 * @param userId the id of the user creating the game-lobby
	 * @return the id of the game
	 */
	override suspend fun perform(userId: String): Either<ApplicationError, String> {
		log().info("Create new game with owner '$userId'")
		return either {
			val game = createGameEntity()
			insertGame.execute(game).bind()
			insertPlayer.execute(createPlayer(userId, game.id)).bind()
			insertTiles.execute(createTiles(game.id, game.seed)).bind()
			game.id
		}
	}

	private fun createGameEntity() = GameEntity(
		id = UUID.gen(),
		seed = Random().nextInt(),
		turn = 0
	)

	private fun createPlayer(userId: String, gameId: String) = PlayerEntity(
		id = UUID.gen(),
		userId = userId,
		gameId = gameId,
		connectionId = null,
		state = PlayerEntity.STATE_PLAYING
	)

	private fun createTiles(gameId: String, seed: Int): List<TileEntity> {
		val tiles = WorldBuilder()
			.buildTiles(seed)
			.map {
				TileEntity(
					id = UUID.gen(),
					gameId = gameId,
					q = it.q,
					r = it.r,
					type = it.data.type.name
				)
			}
		return tiles
	}

}