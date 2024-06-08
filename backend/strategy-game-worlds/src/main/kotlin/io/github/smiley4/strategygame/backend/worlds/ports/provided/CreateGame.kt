package io.github.smiley4.strategygame.backend.worlds.ports.provided

import io.github.smiley4.strategygame.backend.worldgen.WorldSettings

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