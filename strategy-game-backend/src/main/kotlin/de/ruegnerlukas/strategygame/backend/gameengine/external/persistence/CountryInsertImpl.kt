package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDbError
import de.ruegnerlukas.strategygame.backend.common.persistence.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricDbQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CountryInsert

class CountryInsertImpl(private val database: ArangoDatabase) : CountryInsert {

    private val metricId = metricDbQuery(CountryInsert::class)

    override suspend fun execute(country: Country, gameId: String): Either<ArangoDbError, String> {
        return Monitoring.coTime(metricId) {
            database.insertDocument(Collections.COUNTRIES, CountryEntity.of(country, gameId)).map { it.key }
        }
    }

}