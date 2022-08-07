package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryInsert
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class CountryInsertImpl(private val database: ArangoDatabase) : CountryInsert {

	override suspend fun execute(country: CountryEntity) {
		database.insertDocument(Collections.COUNTRIES, country)
	}

}