package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.commondata.TileRef

interface GameService {

    sealed class GameServiceError(message: String?, cause: Throwable? = null) : Exception(message, cause)
    class GameNotFoundError(cause: Throwable? = null) : GameServiceError("The game with the given id does not exist", cause)
    class WorldObjectNotFoundError(cause: Throwable? = null) : GameServiceError("The world-object with the given id does not exist", cause)
    class TileNotFoundError(cause: Throwable? = null) : GameServiceError("The tile with the given id does not exist", cause)


    /**
     * @throws GameServiceError
     * @returns the possible tiles the given world object can move to when starting from the given tile
     */
    suspend fun getAvailableMovementPositions(gameId: String, worldObjectId: String, tileId: String): List<TileRef>
}