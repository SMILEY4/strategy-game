package io.github.smiley4.strategygame.backend.engine.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.TileEntity
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesUpdate


class TilesUpdateImpl(private val database: ArangoDatabase) : TilesUpdate {

    private val metricId = MetricId.query(TilesUpdate::class)

    override suspend fun execute(tiles: Collection<Tile>, gameId: String) {
        return time(metricId) {
            if (database.replaceDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) }).size != tiles.size) {
                throw EntityNotFoundError()
            }
        }
    }

}