package de.ruegnerlukas.strategygame.backend.ports.required.monitoring

import io.micrometer.core.instrument.MeterRegistry

class NoOpMonitoringService : MonitoringService {

    override fun count(id: MonitoringService.Companion.MetricId, amount: Number) {
        // nothing to do
    }

    override fun <T> time(id: MonitoringService.Companion.MetricId, block: () -> T): T {
        return block()
    }

    override suspend fun <T> coTime(id: MonitoringService.Companion.MetricId, block: suspend () -> T): T {
        return block()
    }

    override fun gauge(id: MonitoringService.Companion.MetricId, block: () -> Number) {
        // nothing to do
    }

    override fun summary(id: MonitoringService.Companion.MetricId, amount: Number) {
        // nothing to do
    }

    override fun getRegistry(): MeterRegistry {
        throw UnsupportedOperationException()
    }

}