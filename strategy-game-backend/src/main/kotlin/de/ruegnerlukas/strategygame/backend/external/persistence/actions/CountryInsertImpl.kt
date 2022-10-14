package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDbError
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryInsert

class CountryInsertImpl(private val database: ArangoDatabase) : CountryInsert {

    override suspend fun execute(country: Country): Either<ArangoDbError, String> {
        return database.insertDocument(Collections.COUNTRIES, CountryEntity.of(country)).map { it.key }
    }

}