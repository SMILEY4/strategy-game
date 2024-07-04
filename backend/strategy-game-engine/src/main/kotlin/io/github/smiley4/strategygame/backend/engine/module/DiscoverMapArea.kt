package io.github.smiley4.strategygame.backend.engine.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TilePosition


internal class DiscoverMapArea : Logging {

    private val metricId = MetricId.action(DiscoverMapArea::class)

    /**
     * Discovers all tiles at the given position for the given country
     */
    fun perform(country: Country, game: GameExtended, center: TilePosition, radius: Int) {
        return time(metricId) {
            val tiles = getTiles(game, center, radius)
            uncoverTiles(tiles, country)
        }
    }

    /**
     * Find all tiles with the given positions
     */
    private fun getTiles(game: GameExtended, center: TilePosition, radius: Int): List<Tile> {
        return positionsCircle(center, radius).mapNotNull { game.findTileOrNull(it) }
    }

    /**
     * Mark the given tiles as discovered by the given country
     */
    private fun uncoverTiles(tiles: Collection<Tile>, country: Country) {
        tiles
            .filter { !it.discoveredByCountries.contains(country.countryId) }
            .forEach { it.discoveredByCountries.add(country.countryId) }
    }

}