package de.ruegnerlukas.strategygame.backend.common.monitoring

import io.micrometer.core.instrument.MeterRegistry
import io.micrometer.core.instrument.Tag
import kotlin.reflect.KClass

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
