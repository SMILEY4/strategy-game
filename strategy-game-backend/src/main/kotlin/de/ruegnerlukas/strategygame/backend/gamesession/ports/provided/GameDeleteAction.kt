package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

/**
 * Delete a given game
 */
interface GameDeleteAction {

    /**
     * @param gameId the id of the game to delete
     */
    suspend fun perform(gameId: String)

}