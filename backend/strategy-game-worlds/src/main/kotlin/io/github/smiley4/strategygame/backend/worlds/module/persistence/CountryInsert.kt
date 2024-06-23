package io.github.smiley4.strategygame.backend.worlds.module.persistence

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.ArangoDatabase
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.engine.module.ports.required.CountryInsert
import io.github.smiley4.strategygame.backend.worlds.module.persistence.entities.CountryEntity


class CountryInsert(private val database: ArangoDatabase) {

    private val metricId = MetricId.query(CountryInsert::class)

    suspend fun execute(country: Country, gameId: String): String {
        return time(metricId) {
            database.insertDocument(Collections.COUNTRIES, CountryEntity.of(country, gameId)).key
        }
    }

}