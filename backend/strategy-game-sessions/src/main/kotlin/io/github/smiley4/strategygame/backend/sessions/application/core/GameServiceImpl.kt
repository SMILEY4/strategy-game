package io.github.smiley4.strategygame.backend.sessions.application.core

import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.MovementTarget
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameStateQuery
import io.github.smiley4.strategygame.backend.sessions.ports.provided.GameService
import io.github.smiley4.strategygame.backend.sessions.ports.required.GenericGameService

internal class GameServiceImpl(
    private val gameService: GenericGameService,
    private val gameQuery: GameStateQuery,
) : GameService {

    override suspend fun getAvailableMovementPositions(gameId: Game.Id, worldObjectId: WorldObject.Id, tileId: Tile.Id, currentCost: Int): List<MovementTarget> {
        val game = getGame(gameId)
        val worldObject = getWorldObject(game, worldObjectId)
        val tile = getTile(game, tileId)
        return gameService.getAvailablePositions(game, worldObject, tile.ref(), currentCost, true)
    }

    private suspend fun getGame(gameId: Game.Id): GameState {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameService.GameNotFoundError(e)
        }
    }

    private fun getWorldObject(game: GameState, worldObjectId: WorldObject.Id): WorldObject {
        return game.worldObjects.find { it.id == worldObjectId} ?: throw GameService.WorldObjectNotFoundError()
    }

    private fun getTile(game: GameState, tileId: Tile.Id): Tile {
        return game.tiles.get(tileId) ?: throw GameService.TileNotFoundError()
    }

}