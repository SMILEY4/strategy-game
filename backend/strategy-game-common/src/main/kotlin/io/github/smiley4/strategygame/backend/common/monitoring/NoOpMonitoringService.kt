package io.github.smiley4.strategygame.backend.common.monitoring

class NoOpMonitoringService() : MonitoringService {
    override fun currentTime(): Long = System.currentTimeMillis()
    override fun recordTimer(id: MetricId, time: Long) = Unit
    override fun recordCount(id: MetricId, amount: Number) = Unit
    override fun recordGauge(id: MetricId, block: () -> Number) = Unit
    override fun recordSummary(id: MetricId, amount: Number) = Unit
}