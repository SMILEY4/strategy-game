package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryInsert
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDbError

class CountryInsertImpl(private val database: ArangoDatabase) : CountryInsert {

    override suspend fun execute(country: CountryEntity): Either<ArangoDbError, String> {
        return database.insertDocument(Collections.COUNTRIES, country).map { it.key }
    }

}