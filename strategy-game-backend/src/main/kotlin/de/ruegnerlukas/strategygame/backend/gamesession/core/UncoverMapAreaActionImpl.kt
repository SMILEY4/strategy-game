package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.TilesQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.TilesUpdate
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle

class UncoverMapAreaActionImpl(
    private val tilesByPosition: TilesQueryByGameAndPosition,
    private val tilesUpdate: TilesUpdate
) : UncoverMapAreaAction, Logging {

    private val metricId = metricCoreAction(UncoverMapAreaAction::class)

    override suspend fun perform(countryId: String, gameId: String, center: TilePosition, radius: Int) {
        Monitoring.coTime(metricId) {
            val positions = positionsCircle(center, radius)
            val tiles = findTiles(gameId, positions)
            uncoverTiles(tiles, countryId, gameId)
        }
    }

    /**
     * Find all tiles with the given positions
     */
    private suspend fun findTiles(gameId: String, positions: List<TilePosition>): List<Tile> {
        return tilesByPosition.execute(gameId, positions)
    }

    /**
     * Mark the given tiles as discovered by the given country and update them in the database
     */
    private suspend fun uncoverTiles(tiles: List<Tile>, countryId: String, gameId: String) {
        tiles
            .filter { !it.discoveredByCountries.contains(countryId) }
            .forEach {
                it.discoveredByCountries.add(countryId)
            }
        tilesUpdate.execute(tiles, gameId)
    }

}