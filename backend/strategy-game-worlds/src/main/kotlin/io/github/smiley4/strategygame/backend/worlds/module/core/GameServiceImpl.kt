package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileRef
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.engine.edge.PublicApiService
import io.github.smiley4.strategygame.backend.worlds.edge.GameService
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameExtendedQuery

internal class GameServiceImpl(
    private val publicApiService: PublicApiService,
    private val gameQuery: GameExtendedQuery
) : GameService {

    override suspend fun getAvailableMovementPositions(gameId: String, worldObjectId: String, tileId: String): List<TileRef> {
        val game = findGame(gameId)
        val worldObject = findWorldObject(game, worldObjectId)
        val tile = findTile(game, tileId)
        return publicApiService.getAvailableMovementPositions(game, worldObject, tile)
    }

    private suspend fun findGame(gameId: String): GameExtended {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameService.GameNotFoundError(e)
        }
    }

    private fun findWorldObject(game: GameExtended, worldObjectId: String): WorldObject {
        return game.findWorldObject(worldObjectId) ?: throw GameService.WorldObjectNotFoundError()
    }

    private fun findTile(game: GameExtended, tileId: String): Tile {
        return game.findTileOrNull(tileId) ?: throw GameService.TileNotFoundError()
    }

}