package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.getOrElse
import com.fasterxml.jackson.annotation.JsonAlias
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase

class ReservationInsertImpl(private val database: ArangoDatabase): ReservationInsert {

	companion object {
		data class ReservationEntity(
			@JsonAlias("_documentType")
			val documentType: String = "reservation"
		)
	}

	override suspend fun execute(collection: String): String {
		return database.insertDocument(collection, ReservationEntity())
			.map { it.key }
			.getOrElse { throw Exception("Could not reserve id for entity in collection $collection") }
	}

}