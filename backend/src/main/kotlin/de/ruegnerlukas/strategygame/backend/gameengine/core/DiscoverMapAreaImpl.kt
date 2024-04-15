package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.DiscoverMapArea
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.DiscoverMapArea.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.DiscoverMapArea.NoTilesError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExistsQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesUpdate

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
            throw GameNotFoundError()
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
            throw NoTilesError()
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