package io.github.smiley4.strategygame.backend.common.monitoring

interface MonitoringService {
    fun currentTime(): Long
    fun recordTimer(id: MetricId, time: Long)
    fun recordCount(id: MetricId, amount: Number)
    fun recordGauge(id: MetricId, block: () -> Number)
    fun recordSummary(id: MetricId, amount: Number)
}