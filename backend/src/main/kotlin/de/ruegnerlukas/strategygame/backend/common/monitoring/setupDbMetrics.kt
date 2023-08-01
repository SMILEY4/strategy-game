package de.ruegnerlukas.strategygame.backend.common.monitoring

import de.ruegnerlukas.strategygame.backend.common.persistence.Collections
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.micrometer.core.instrument.Tag
import kotlinx.coroutines.runBlocking

fun setupDbMetrics(database: ArangoDatabase) {
    Collections.ALL.forEach { collectionName ->
        Monitoring.gauge(MetricId("db.collection.size", listOf(Tag.of("name", collectionName)))) {
            runBlocking { database.count(collectionName) }
        }
    }
}