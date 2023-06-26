package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileData
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.models.trackingListOf
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializeWorldAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesInsert
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldBuilder
import de.ruegnerlukas.strategygame.backend.worldcreation.WorldSettings

class InitializeWorldActionImpl(
    private val worldBuilder: WorldBuilder,
    private val tileInsert: TilesInsert
) : InitializeWorldAction {

    override suspend fun perform(gameId: String, worldSettings: WorldSettings) {
        val tiles = buildTiles(worldSettings)
        saveTiles(tiles, gameId)
    }

    private fun buildTiles(worldSettings: WorldSettings): List<Tile> {
        return worldBuilder.buildTiles(worldSettings).map {
            Tile(
                tileId = DbId.PLACEHOLDER,
                position = TilePosition(it.q, it.r),
                data = TileData(
                    terrainType = it.type,
                    resourceType = it.resource
                ),
                content = trackingListOf(),
                influences = mutableListOf(),
                owner = null,
                discoveredByCountries = mutableListOf()
            )
        }
    }

    private suspend fun saveTiles(tiles: List<Tile>, gameId: String) {
        tileInsert.insert(tiles, gameId)
    }

}