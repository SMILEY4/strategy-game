package io.github.smiley4.strategygame.backend.commonarangodb

import com.fasterxml.jackson.annotation.JsonAlias

class ReservationInsert(private val database: ArangoDatabase) {

    companion object {
        data class ReservationEntity(
            @JsonAlias("_documentType")
            val documentType: String = "reservation"
        )
    }

    suspend fun execute(collection: String): String {
        try {
            return database.insertDocument(collection, ReservationEntity()).key
        } catch (e: ArangoDbError) {
            throw Exception("Could not reserve id for entity in collection $collection")
        }
    }

}