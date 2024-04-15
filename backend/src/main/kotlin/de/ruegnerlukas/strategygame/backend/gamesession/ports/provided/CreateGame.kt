package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings

/**
 * Create a new game
 */
interface CreateGame {

	sealed class CreateGameError : Exception()
	class GameNotFoundError : CreateGameError()
	class WorldInitError : CreateGameError()


	/**
	 * @return the id of the game
	 * @throws CreateGameError
	 */
	suspend fun perform(name: String, worldSettings: WorldSettings): String

}