package io.github.smiley4.strategygame.backend.engine.external.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.engine.external.persistence.models.CountryEntity
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.required.CountryInsert


class CountryInsertImpl(private val database: ArangoDatabase) : CountryInsert {

    private val metricId = MetricId.query(CountryInsert::class)

    override suspend fun execute(country: Country, gameId: String): String {
        return time(metricId) {
            database.insertDocument(Collections.COUNTRIES, CountryEntity.of(country, gameId)).key
        }
    }

}