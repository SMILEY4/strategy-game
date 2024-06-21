package io.github.smiley4.strategygame.backend.engine.core

import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.common.models.TileData
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.models.trackingListOf
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.DbId
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializeWorld
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExistsQuery
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesInsert
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenerator
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings

class InitializeWorldImpl(
    private val worldBuilder: WorldGenerator,
    private val tileInsert: TilesInsert,
    private val gameExistsQuery: GameExistsQuery
) : InitializeWorld {

    private val metricId = MetricId.action(InitializeWorld::class)

    override suspend fun perform(gameId: String, worldSettings: WorldGenSettings) {
        return time(metricId) {
            validateGame(gameId)
            val tiles = buildTiles(worldSettings)
            saveTiles(tiles, gameId)
        }
    }

    private suspend fun validateGame(gameId: String) {
        if (!gameExistsQuery.perform(gameId)) {
            throw InitializeWorld.GameNotFoundError()
        }
    }

    private fun buildTiles(worldSettings: WorldGenSettings): List<Tile> {
        return worldBuilder.buildTiles(worldSettings).map {
            Tile(
                tileId = DbId.PLACEHOLDER,
                position = TilePosition(it.q, it.r),
                data = TileData(
                    terrainType = it.type,
                    resourceType = it.resource
                ),
                objects = trackingListOf(),
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