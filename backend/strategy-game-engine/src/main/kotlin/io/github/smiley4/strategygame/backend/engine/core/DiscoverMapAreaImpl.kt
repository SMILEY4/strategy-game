package io.github.smiley4.strategygame.backend.engine.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.engine.ports.provided.DiscoverMapArea
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExistsQuery
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesQueryByGameAndPosition
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesUpdate


class DiscoverMapAreaImpl(
    private val tilesByPosition: TilesQueryByGameAndPosition,
    private val tilesUpdate: TilesUpdate,
    private val gameExistsQuery: GameExistsQuery
) : DiscoverMapArea, Logging {

    private val metricId = MetricId.action(DiscoverMapArea::class)

    override suspend fun perform(countryId: String, gameId: String, center: TilePosition, radius: Int) {
        return time(metricId) {
            validateGame(gameId)
            val tiles = findTiles(gameId, positionsCircle(center, radius))
            uncoverTiles(tiles, countryId, gameId)
        }
    }


    /**
     * Check if the game with the given id exists
     */
    private suspend fun validateGame(gameId: String) {
        if (!gameExistsQuery.perform(gameId)) {
            throw DiscoverMapArea.GameNotFoundError()
        }
    }


    /**
     * Find all tiles with the given positions
     */
    private suspend fun findTiles(gameId: String, positions: Collection<TilePosition>): List<Tile> {
        val tiles = tilesByPosition.execute(gameId, positions)
        if (tiles.isNotEmpty()) {
            return tiles
        } else {
            throw DiscoverMapArea.NoTilesError()
        }
    }


    /**
     * Mark the given tiles as discovered by the given country and update them in the database
     */
    private suspend fun uncoverTiles(tiles: Collection<Tile>, countryId: String, gameId: String) {
        tiles
            .filter { !it.discoveredByCountries.contains(countryId) }
            .forEach { it.discoveredByCountries.add(countryId) }
        tilesUpdate.execute(tiles, gameId)
    }

}