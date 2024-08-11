package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.MovementService
import io.github.smiley4.strategygame.backend.worlds.edge.GameService
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedQuery

internal class GameServiceImpl(
    private val movementService: MovementService,
    private val gameQuery: GameExtendedQuery
) : GameService {

    override suspend fun getAvailableMovementPositions(gameId: String, worldObjectId: String, tileId: String, currentCost: Int): List<MovementTarget> {
        val game = getGame(gameId)
        val worldObject = getWorldObject(game, worldObjectId)
        val tile = getTile(game, tileId)
        return movementService.getAvailablePositions(game, worldObject, tile.ref(), currentCost)
    }

    private suspend fun getGame(gameId: String): GameExtended {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameService.GameNotFoundError(e)
        }
    }

    private fun getWorldObject(game: GameExtended, worldObjectId: String): WorldObject {
        return game.findWorldObjectOrNull(worldObjectId) ?: throw GameService.WorldObjectNotFoundError()
    }

    private fun getTile(game: GameExtended, tileId: String): Tile {
        return game.findTileOrNull(tileId) ?: throw GameService.TileNotFoundError()
    }

}