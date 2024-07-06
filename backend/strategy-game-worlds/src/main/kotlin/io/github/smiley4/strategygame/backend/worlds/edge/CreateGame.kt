package io.github.smiley4.strategygame.backend.worlds.edge


/**
 * Create a new game
 */
interface CreateGame {

	sealed class CreateGameError(message: String, cause: Throwable? = null) : Exception(message, cause)


	/**
	 * @return the id of the created game
	 * @throws CreateGameError
	 */
	suspend fun perform(name: String, seed: Int?): String

}