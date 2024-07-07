package io.github.smiley4.strategygame.backend.common.monitoring

import io.micrometer.core.instrument.Clock
import io.micrometer.core.instrument.Counter
import io.micrometer.core.instrument.DistributionSummary
import io.micrometer.core.instrument.Gauge
import io.micrometer.core.instrument.Timer
import io.micrometer.prometheus.PrometheusMeterRegistry
import java.util.concurrent.TimeUnit

class MicrometerMonitoringService(private val registry: PrometheusMeterRegistry) : MonitoringService {

    private val clock = Clock.SYSTEM

    private val timers = mutableMapOf<MetricId, Timer>()
    private val gauges = mutableMapOf<MetricId, Gauge>()
    private val counters = mutableMapOf<MetricId, Counter>()
    private val summaries = mutableMapOf<MetricId, DistributionSummary>()


    override fun currentTime(): Long = clock.monotonicTime()

    override fun recordTimer(id: MetricId, time: Long) {
        timers
            .computeIfAbsent(id) {
                Timer
                    .builder(it.name)
                    .tags(it.tags)
                    .register(registry)
            }
            .record(time, TimeUnit.NANOSECONDS)
    }

    override fun recordCount(id: MetricId, amount: Number) {
        counters
            .computeIfAbsent(id) {
                Counter
                    .builder(id.name)
                    .tags(id.tags)
                    .register(registry)
            }
            .increment(amount.toDouble())
    }

    override fun recordGauge(id: MetricId, block: () -> Number) {
        gauges.computeIfAbsent(id) {
            Gauge
                .builder(it.name, block)
                .tags(it.tags)
                .register(registry)
        }
    }

    override fun recordSummary(id: MetricId, amount: Number) {
        summaries
            .computeIfAbsent(id) {
                DistributionSummary
                    .builder(it.name)
                    .tags(it.tags)
                    .register(registry)
            }
            .record(amount.toDouble())
    }

    fun getRegistry() = registry

}