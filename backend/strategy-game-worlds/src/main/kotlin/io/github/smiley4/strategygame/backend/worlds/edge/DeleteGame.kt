package io.github.smiley4.strategygame.backend.worlds.edge

/**
 * Delete a given game
 */
interface DeleteGame {

    /**
     * @param gameId the id of the game to delete
     */
    suspend fun perform(gameId: String)

}