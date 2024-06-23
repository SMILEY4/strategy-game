package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.TileEntity


class TilesInsert(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(TilesInsert::class)

    suspend fun insert(tiles: Collection<Tile>, gameId: String) {
        return time(metricId) {
            insertTiles(tiles, gameId)
        }
    }

    private suspend fun insertTiles(tiles: Collection<Tile>, gameId: String) {
        database.insertDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

}