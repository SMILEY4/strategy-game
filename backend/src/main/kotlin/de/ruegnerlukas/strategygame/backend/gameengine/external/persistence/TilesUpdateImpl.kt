package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.TileEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesUpdate

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