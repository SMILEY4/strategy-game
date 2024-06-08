package io.github.smiley4.strategygame.backend.engine.external.persistence

import com.fasterxml.jackson.annotation.JsonAlias
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDbError
import io.github.smiley4.strategygame.backend.engine.ports.required.ReservationInsert

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