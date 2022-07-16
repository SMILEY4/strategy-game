package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
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

	override suspend fun perform(userId: String): String {
		log().info("Create new game with owner '$userId'")
		val game = createGameEntity()
		val player = createOwnerPlayer(userId, game.id)
		saveGameData(game)
		savePlayer(player)
		return game.id
	}

	private suspend fun saveGameData(game: GameEntity) {
		insertGame.execute(game)
			.getOrElse { throw Exception("Could not save game ${game.id}") }
		insertTiles.execute(createTiles(game.id, game.seed))
			.getOrElse { throw Exception("Could not save tiles for game ${game.id}") }
	}

	private suspend fun savePlayer(player: PlayerEntity) {
		return insertPlayer.execute(player)
			.getOrElse { throw Exception("Could not save player ${player.id} (userId=${player.userId}, gameId=${player.gameId})") }
	}

	private fun createGameEntity() = GameEntity(
		id = UUID.gen(),
		seed = Random().nextInt(),
		turn = 0
	)

	private fun createOwnerPlayer(userId: String, gameId: String) = PlayerEntity(
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