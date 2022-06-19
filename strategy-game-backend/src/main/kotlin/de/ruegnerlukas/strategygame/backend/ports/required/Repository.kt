package de.ruegnerlukas.strategygame.backend.ports.required

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.world.Tile
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface Repository {

	/**
	 * Creates a new game
	 * @return the id of the game
	 */
	suspend fun insertGame(): Either<String, ApplicationError>


	suspend fun getGame(gameId: String): Either<String, ApplicationError>


	/**
	 * Insert the given tiles for the given game
	 */
	suspend fun insertTiles(gameId: String, tiles: List<Tile>): Either<Unit, ApplicationError>


	/**
	 * Adds the given user to the given game
	 * @return the id of the participant
	 */
	suspend fun insertParticipant(gameId: String, userId: String): Either<String, ApplicationError>

}