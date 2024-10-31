package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.commondata.GameSessionData
import io.github.smiley4.strategygame.backend.commondata.User

/**
 * List all games of a user
 */
interface ListGames {

    /**
     * @param userId the id of the user to return the games of
     */
    suspend fun perform(userId: User.Id): List<GameSessionData>

}