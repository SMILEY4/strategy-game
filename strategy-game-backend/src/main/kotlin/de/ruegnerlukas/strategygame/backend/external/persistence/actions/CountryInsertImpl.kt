package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDbError
import de.ruegnerlukas.strategygame.backend.external.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryInsert

class CountryInsertImpl(private val database: ArangoDatabase) : CountryInsert {

    private val metricId = metricDbQuery(CountryInsert::class)

    override suspend fun execute(country: Country, gameId: String): Either<ArangoDbError, String> {
        return Monitoring.coTime(metricId) {
            database.insertDocument(Collections.COUNTRIES, CountryEntity.of(country, gameId)).map { it.key }
        }
    }

}