package de.ruegnerlukas.strategygame.backend.common.monitoring

import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.MetricId
import org.koin.java.KoinJavaComponent.inject

object Monitoring {

    var enabled = true

    val monitoring: MonitoringService
        get() = if (enabled) inject<MonitoringService>(MonitoringService::class.java).value else NoOpMonitoringService()

    fun count(id: MetricId, amount: Number) = monitoring.count(id, amount)

    fun <T> time(id: MetricId, block: () -> T) = monitoring.time(id, block)

    suspend fun <T> coTime(id: MetricId, block: suspend () -> T) = monitoring.coTime(id, block)

    fun gauge(id: MetricId, block: () -> Number) = monitoring.gauge(id, block)

    fun summary(id: MetricId, amount: Number) = monitoring.summary(id, amount)




}
