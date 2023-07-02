package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.TileEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesInsert

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