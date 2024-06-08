package io.github.smiley4.strategygame.backend.engine.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.TileEntity
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesInsert


class TilesInsertImpl(private val database: ArangoDatabase) : TilesInsert {

    private val metricId = MetricId.query(TilesInsert::class)

    override suspend fun insert(tiles: Collection<Tile>, gameId: String) {
        return time(metricId) {
            insertTiles(tiles, gameId)
        }
    }

    private suspend fun insertTiles(tiles: Collection<Tile>, gameId: String) {
        database.insertDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

}