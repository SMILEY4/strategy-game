package io.github.smiley4.strategygame.backend.app.testdsl.assertions

import io.github.smiley4.strategygame.backend.app.testdsl.GameTestContext
import io.github.smiley4.strategygame.backend.app.testdsl.accessors.getCities
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceStack
import io.github.smiley4.strategygame.backend.common.utils.coApply
import io.github.smiley4.strategygame.backend.engine.ports.models.BuildingProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.ports.models.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.ports.models.SettlerProductionQueueEntry
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.floats.plusOrMinus
import io.kotest.matchers.shouldBe

suspend fun GameTestContext.expectProductionQueue(cityId: String, block: suspend ProductionQueueAssertionDsl.() -> Unit) {
    val dslConfig = ProductionQueueAssertionDsl().coApply(block)
    val city = getCities().find { it.cityId == cityId }!!
    city.infrastructure.productionQueue shouldHaveSize dslConfig.entries.size
    city.infrastructure.productionQueue.map { buildDescriptor(it) } shouldContainExactly dslConfig.entries.map { it.descriptor }
    dslConfig.entries.forEachIndexed { index, entry ->
        if (entry.collected != null) {
            val expected = entry.collected!!
            val actual = city.infrastructure.productionQueue[index].collectedResources
            ResourceCollection.basic(expected).forEach(true) { type, amount ->
                actual[type] shouldBe amount.plusOrMinus(0.0001f)
            }
        }
    }
}

private fun buildDescriptor(entry: ProductionQueueEntry): String {
    return when (entry) {
        is BuildingProductionQueueEntry -> "building.${entry.buildingType}"
        is SettlerProductionQueueEntry -> "settler"
    }
}


class ProductionQueueAssertionDsl {
    val entries = mutableListOf<ProductionQueueEntryAssertionDsl>()
    suspend fun entry(descriptor: String) = entry(descriptor) {}
    suspend fun entry(descriptor: String, block: suspend ProductionQueueEntryAssertionDsl.() -> Unit) {
        entries.add(ProductionQueueEntryAssertionDsl(descriptor).coApply(block))
    }
}

class ProductionQueueEntryAssertionDsl(val descriptor: String) {
    var collected: List<ResourceStack>? = null
}