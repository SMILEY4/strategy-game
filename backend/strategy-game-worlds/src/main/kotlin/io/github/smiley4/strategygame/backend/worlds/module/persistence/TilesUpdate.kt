package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.TileEntity


class TilesUpdate(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(TilesUpdate::class)

    suspend fun execute(tiles: Collection<Tile>, gameId: String) {
        return time(metricId) {
            if (database.replaceDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) }).size != tiles.size) {
                throw EntityNotFoundError()
            }
        }
    }

}