package io.github.smiley4.strategygame.backend.sessions.services

import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.engine.ports.provided.GenericGameService
import io.github.smiley4.strategygame.backend.worldgen.lib.NameGenerator

internal class GameServices(
    private val gameDbStateQuery: GameDbStateQuery,
    private val gameService: GenericGameService,
    private val nameGenerator: NameGenerator
) {

    suspend fun getAvailableMovementPositions(
        gameId: Game.Id,
        worldObjectId: WorldObject.Id,
        tileId: Tile.Id,
        currentCost: Int
    ): List<MovementTarget> {
        val game = getGame(gameId)
        val worldObject = getWorldObject(game, worldObjectId)
        val tile = getTile(game, tileId)
        return gameService.getAvailablePositions(game, worldObject, tile.ref(), currentCost, true)
    }

    fun getRandomSettlementName(): String {
        return nameGenerator.generateSettlementName()
    }

    private suspend fun getGame(gameId: Game.Id): GameState {
        try {
            return gameDbStateQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameServicesError.GameNotFoundError(e)
        }
    }

    private fun getWorldObject(game: GameState, worldObjectId: WorldObject.Id): WorldObject {
        return game.worldObjects.find { it.id == worldObjectId } ?: throw GameServicesError.WorldObjectNotFoundError()
    }

    private fun getTile(game: GameState, tileId: Tile.Id): Tile {
        return game.tiles.get(tileId) ?: throw GameServicesError.TileNotFoundError()
    }


}