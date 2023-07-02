package de.ruegnerlukas.strategygame.backend.gameengine.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.DiscoverMapArea
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.DiscoverMapArea.DiscoverMapAreaError
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

    private val metricId = metricCoreAction(DiscoverMapArea::class)

    override suspend fun perform(countryId: String, gameId: String, center: TilePosition, radius: Int): Either<DiscoverMapAreaError, Unit> {
        return Monitoring.coTime(metricId) {
            either {
                validateGame(gameId).bind()
                val tiles = findTiles(gameId, positionsCircle(center, radius)).bind()
                uncoverTiles(tiles, countryId, gameId)
            }
        }
    }


    /**
     * Check if the game with the given id exists
     */
    private suspend fun validateGame(gameId: String): Either<GameNotFoundError, Unit> {
        return if(gameExistsQuery.perform(gameId)) {
            Unit.ok()
        } else {
            GameNotFoundError.err()
        }
    }

    /**
     * Find all tiles with the given positions
     */
    private suspend fun findTiles(gameId: String, positions: Collection<TilePosition>): Either<NoTilesError, List<Tile>> {
        val tiles = tilesByPosition.execute(gameId, positions)
        return if (tiles.isEmpty()) {
            NoTilesError.err()
        } else {
            tiles.ok()
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