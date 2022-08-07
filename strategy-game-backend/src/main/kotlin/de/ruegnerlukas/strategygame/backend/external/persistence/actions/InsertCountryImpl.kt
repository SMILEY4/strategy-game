package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertCountry
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

class InsertCountryImpl(private val database: ArangoDatabase) : InsertCountry {

	override suspend fun execute(country: CountryEntity) {
		database.insertDocument(Collections.COUNTRIES, country)
	}

}