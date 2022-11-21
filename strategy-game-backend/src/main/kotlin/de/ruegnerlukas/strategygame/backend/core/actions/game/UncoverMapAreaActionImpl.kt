package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.provided.game.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesUpdate
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

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