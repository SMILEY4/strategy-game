package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import arrow.core.getOrElse
import com.fasterxml.jackson.annotation.JsonAlias
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.ReservationInsert

class ReservationInsertImpl(private val database: ArangoDatabase) : ReservationInsert {

    private val metricId = metricDbQuery(ReservationInsert::class)

    companion object {
        data class ReservationEntity(
            @JsonAlias("_documentType")
            val documentType: String = "reservation"
        )
    }

    override suspend fun execute(collection: String): String {
        return Monitoring.coTime(metricId) {
            database.insertDocument(collection, ReservationEntity())
                .map { it.key }
                .getOrElse { throw Exception("Could not reserve id for entity in collection $collection") }
        }
    }

}