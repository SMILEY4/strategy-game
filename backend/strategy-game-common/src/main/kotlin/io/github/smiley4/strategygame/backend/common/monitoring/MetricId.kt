package io.github.smiley4.strategygame.backend.common.monitoring

import io.micrometer.core.instrument.Tag
import kotlin.reflect.KClass

data class MetricId(
    val name: String,
    val tags: List<Tag>
) {

    companion object {
        fun action(id: KClass<*>) = MetricId("db.query", listOf(Tag.of("name", id.simpleName ?: "?")))
        fun query(id: KClass<*>) = MetricId("core.action", listOf(Tag.of("name", id.simpleName ?: "?")))
    }

}