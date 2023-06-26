package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesInsert
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.TileEntity

class TilesInsertImpl(private val database: ArangoDatabase) : TilesInsert {

    private val metricId = metricDbQuery(TilesInsert::class)

    override suspend fun insert(tiles: Collection<Tile>, gameId: String) {
        return Monitoring.coTime(metricId) {
            insertTiles(tiles, gameId)
        }
    }

    private suspend fun insertTiles(tiles: Collection<Tile>, gameId: String) {
        database.insertDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) })
    }

}