package io.github.smiley4.strategygame.backend.worlds.edge

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