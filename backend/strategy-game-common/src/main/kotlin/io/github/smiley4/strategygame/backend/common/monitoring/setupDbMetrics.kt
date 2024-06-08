package io.github.smiley4.strategygame.backend.common.monitoring

import io.github.smiley4.strategygame.backend.common.persistence.Collections
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.micrometer.core.instrument.Tag
import kotlinx.coroutines.runBlocking

fun setupDbMetrics(database: ArangoDatabase) {
    Collections.ALL.forEach { collectionName ->
        Monitoring.gauge(MetricId("db.collection.size", listOf(Tag.of("name", collectionName)))) {
            runBlocking { database.count(collectionName) }
        }
    }
}