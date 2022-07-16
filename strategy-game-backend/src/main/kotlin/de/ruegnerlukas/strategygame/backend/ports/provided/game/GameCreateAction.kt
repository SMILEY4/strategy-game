package de.ruegnerlukas.strategygame.backend.ports.provided.game


interface GameCreateAction {

	/**
	 * @param userId the id of the user creating the game-lobby
	 * @return the id of the game
	 */
	suspend fun perform(userId: String): String

}