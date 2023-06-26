package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.TileEntity
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesUpdate

class TilesUpdateImpl(private val database: ArangoDatabase) : TilesUpdate {

    private val metricId = metricDbQuery(TilesUpdate::class)

    override suspend fun execute(tiles: List<Tile>, gameId: String): Either<EntityNotFoundError, Unit> {
        return Monitoring.coTime(metricId) {
            if (database.replaceDocuments(Collections.TILES, tiles.map { TileEntity.of(it, gameId) }).size == tiles.size) {
                Unit.right()
            } else {
                EntityNotFoundError.left()
            }
        }
    }

}