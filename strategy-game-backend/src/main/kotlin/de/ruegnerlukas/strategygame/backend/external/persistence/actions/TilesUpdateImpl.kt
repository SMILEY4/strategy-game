package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesUpdate

class TilesUpdateImpl(private val database: ArangoDatabase) : TilesUpdate {

    private val metricId = metricDbQuery(TilesUpdate::class)

    override suspend fun execute(tiles: List<TileEntity>): Either<EntityNotFoundError, Unit> {
        return Monitoring.coTime(metricId) {
            if (database.replaceDocuments(Collections.TILES, tiles).size == tiles.size) {
                Unit.right()
            } else {
                EntityNotFoundError.left()
            }
        }
    }

}