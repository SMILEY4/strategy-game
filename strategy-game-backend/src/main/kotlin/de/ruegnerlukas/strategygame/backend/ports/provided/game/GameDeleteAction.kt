package de.ruegnerlukas.strategygame.backend.ports.provided.game

/**
 * Delete a given game
 */
interface GameDeleteAction {

    /**
     * @param gameId the id of the game to delete
     */
    suspend fun perform(gameId: String)

}