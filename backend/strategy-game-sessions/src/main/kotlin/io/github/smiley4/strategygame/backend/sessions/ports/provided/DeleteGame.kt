package io.github.smiley4.strategygame.backend.sessions.ports.provided

import io.github.smiley4.strategygame.backend.commondata.Game

/**
 * Delete a given game
 */
interface DeleteGame {

    /**
     * @param game the id of the game to delete
     */
    suspend fun perform(game: Game.Id)

}