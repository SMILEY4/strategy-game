package de.ruegnerlukas.strategygame.backend.core.actions.gamelobby

import de.ruegnerlukas.strategygame.backend.core.world.WorldBuilder
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.ports.provided.gamelobby.GameLobbyCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.Repository
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.flatMap
import de.ruegnerlukas.strategygame.backend.shared.either.map
import de.ruegnerlukas.strategygame.backend.shared.either.then2

/**
 * Create a new game-lobby
 */
class GameLobbyCreateActionImpl(private val repository: Repository) : GameLobbyCreateAction, Logging {

	/**
	 * @param userId the id of the user creating the game-lobby
	 */
	override suspend fun perform(userId: String): Either<String, ApplicationError> {
		log().info("Create new game-lobby with owner $userId")
		return Either.start()
			.flatMap { repository.insertGame() }
			.then2 { repository.insertTiles(it, buildTileMap()) }

//		return Ok()
//			.mapCatching({ repository.insertGame() }, InternalApplicationError)
//			.thenCatching({ repository.insertTiles(it, buildTileMap()) }, InternalApplicationError)
	}

	private fun buildTileMap(): List<Tile> {
		return WorldBuilder().buildTiles()
	}

}