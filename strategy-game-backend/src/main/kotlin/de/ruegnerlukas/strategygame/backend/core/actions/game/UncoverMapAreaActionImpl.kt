package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesUpdate
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

class UncoverMapAreaActionImpl(
    private val tilesByPosition: TilesQueryByGameAndPosition,
    private val tilesUpdate: TilesUpdate
) : UncoverMapAreaAction, Logging {

    override suspend fun perform(countryId: String, gameId: String, center: TilePosition, radius: Int) {
        val positions = positionsCircle(center, radius)
        val tiles = findTiles(gameId, positions)
        uncoverTiles(tiles, countryId)
    }


    /**
     * Find all tiles with the given positions
     */
    private suspend fun findTiles(gameId: String, positions: List<TilePosition>): List<TileEntity> {
        return tilesByPosition.execute(gameId, positions)
    }


    /**
     * Mark the given tiles as discovered by the given country and update them in the database
     */
    private suspend fun uncoverTiles(tiles: List<TileEntity>, countryId: String) {
        tiles
            .filter { !it.discoveredByCountries.contains(countryId) }
            .forEach {
                it.discoveredByCountries.add(countryId)
            }
        tilesUpdate.execute(tiles)
    }

}