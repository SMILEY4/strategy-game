package de.ruegnerlukas.strategygame.backend.external.monitoring

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService.Companion.MetricId
import io.micrometer.core.instrument.Clock
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.DistributionSummary
import io.micrometer.core.instrument.Gauge
import io.micrometer.core.instrument.Tag
import io.micrometer.core.instrument.Timer
import io.micrometer.prometheus.PrometheusMeterRegistry
import kotlinx.coroutines.runBlocking
import java.util.concurrent.TimeUnit

class MonitoringServiceImpl(
    private val registry: PrometheusMeterRegistry,
    private val database: ArangoDatabase
) : MonitoringService {

    private val clock = Clock.SYSTEM
    private val counters = mutableMapOf<MetricId, Counter>()
    private val timers = mutableMapOf<MetricId, Timer>()
    private val gauges = mutableMapOf<MetricId, Gauge>()
    private val summaries = mutableMapOf<MetricId, DistributionSummary>()

    init {
        Collections.ALL.forEach { collectionName ->
            gauge(MetricId("db.collection.size", listOf(Tag.of("name", collectionName)))) {
                runBlocking { database.count(collectionName) }
            }
        }
    }

    override fun count(id: MetricId, amount: Number) {
        counters
            .computeIfAbsent(id) {
                Counter
                    .builder(id.name)
                    .tags(id.tags)
                    .register(registry)
            }
            .increment(amount.toDouble())
    }

    override fun <T> time(id: MetricId, block: () -> T): T {
        val ts = clock.monotonicTime()
        try {
            return block()
        } finally {
            val te = clock.monotonicTime()
            getTimer(id).record(te - ts, TimeUnit.NANOSECONDS)
        }
    }

    override suspend fun <T> coTime(id: MetricId, block: suspend () -> T): T {
        val ts = clock.monotonicTime()
        try {
            return block()
        } finally {
            val te = clock.monotonicTime()
            getTimer(id).record(te - ts, TimeUnit.NANOSECONDS)
        }
    }

    private fun getTimer(id: MetricId): Timer {
        return timers.computeIfAbsent(id) {
            Timer
                .builder(it.name)
                .tags(it.tags)
                .register(registry)
        }
    }

    override fun gauge(id: MetricId, block: () -> Number) {
        gauges.computeIfAbsent(id) {
            Gauge
                .builder(it.name, block)
                .tags(it.tags)
                .register(registry)
        }
    }

    override fun summary(id: MetricId, amount: Number) {
        summaries
            .computeIfAbsent(id) {
                DistributionSummary
                    .builder(it.name)
                    .tags(it.tags)
                    .register(registry)
            }
            .record(amount.toDouble())
    }

    override fun getRegistry() = registry

}