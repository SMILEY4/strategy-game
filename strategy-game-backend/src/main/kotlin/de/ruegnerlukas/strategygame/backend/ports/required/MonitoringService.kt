package de.ruegnerlukas.strategygame.backend.ports.required

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tag
import org.koin.java.KoinJavaComponent.inject
import kotlin.reflect.KClass


object Monitoring {

    val monitoring by inject<MonitoringService>(MonitoringService::class.java)

    fun count(id: MonitoringService.Companion.MetricId, amount: Number) = monitoring.count(id, amount)

    fun <T> time(id: MonitoringService.Companion.MetricId, block: () -> T) = monitoring.time(id, block)

    suspend fun <T> coTime(id: MonitoringService.Companion.MetricId, block: suspend () -> T) = monitoring.coTime(id, block)

    fun gauge(id: MonitoringService.Companion.MetricId, block: () -> Number) = monitoring.gauge(id, block)

    fun summary(id: MonitoringService.Companion.MetricId, amount: Number) = monitoring.summary(id, amount)

}

interface MonitoringService {

    companion object {

        data class MetricId(
            val name: String,
            val tags: List<Tag>
        )

        fun metricDbQuery(queryName: KClass<*>) = MetricId("db.query", listOf(Tag.of("name", queryName.simpleName ?: "?")))

        fun metricCoreAction(actionName: KClass<*>) = MetricId("core.action", listOf(Tag.of("name", actionName.simpleName ?: "?")))

    }

    fun count(id: MetricId, amount: Number)

    fun <T> time(id: MetricId, block: () -> T): T

    suspend fun <T> coTime(id: MetricId, block: suspend () -> T): T

    fun gauge(id: MetricId, block: () -> Number)

    fun summary(id: MetricId, amount: Number)

    fun getRegistry(): MeterRegistry

}