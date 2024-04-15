package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import com.fasterxml.jackson.annotation.JsonAlias
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDbError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.ReservationInsert

class ReservationInsertImpl(private val database: ArangoDatabase) : ReservationInsert {

    private val metricId = MetricId.query(ReservationInsert::class)

    companion object {
        data class ReservationEntity(
            @JsonAlias("_documentType")
            val documentType: String = "reservation"
        )
    }

    override suspend fun execute(collection: String): String {
        return time(metricId) {
            try {
                database.insertDocument(collection, ReservationEntity()).key
            } catch (e: ArangoDbError) {
                throw Exception("Could not reserve id for entity in collection $collection")
            }
        }
    }

}