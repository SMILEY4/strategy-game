package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ExtGameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.gameext.ExtGameInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID
import java.util.Random

/**
 * Create a new game
 */
class GameCreateActionImpl(
	private val insertExtGame: ExtGameInsert
) : GameCreateAction, Logging {

	override suspend fun perform(userId: String): String {
		log().info("Create new game with owner '$userId'")
		val game = createExtGameEntity(userId)
		saveGame(game)
		return game.id
	}

	private suspend fun saveGame(game: ExtGameEntity) {
		insertExtGame.execute(game)
			.getOrElse { throw Exception("Could not save ext-game ${game.id}") }
	}

	private fun createExtGameEntity(userId: String): ExtGameEntity {
		val gameId = UUID.gen()
		val seed = Random().nextInt()
		val player = createOwnerPlayer(userId, gameId)
		return ExtGameEntity(
			id = gameId,
			seed = seed,
			turn = 0,
			players = listOf(player),
			tiles = createTiles(gameId, seed),
			markers = listOf(),
			countries = listOf(createOwnerCountry(player))
		)
	}

	private fun createOwnerPlayer(userId: String, gameId: String) = PlayerEntity(
		id = UUID.gen(),
		userId = userId,
		gameId = gameId,
		connectionId = null,
		state = PlayerEntity.STATE_PLAYING
	)

	private fun createOwnerCountry(player: PlayerEntity) = CountryEntity(
		id = UUID.gen(),
		playerId = player.id,
		amountMoney = 200f
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