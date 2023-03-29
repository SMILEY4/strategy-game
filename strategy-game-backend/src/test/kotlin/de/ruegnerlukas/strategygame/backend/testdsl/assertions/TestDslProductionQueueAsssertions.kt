package de.ruegnerlukas.strategygame.backend.testdsl.assertions

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.shared.coApply
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCities
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.floats.plusOrMinus
import io.kotest.matchers.shouldBe

suspend fun GameTestContext.expectProductionQueue(cityId: String, block: suspend ProductionQueueAssertionDsl.() -> Unit) {
    val dslConfig = ProductionQueueAssertionDsl().coApply(block)
    val city = getCities().find { it.cityId == cityId }!!
    city.productionQueue.map { it.buildingType } shouldContainExactly dslConfig.entries.map { it.building }
    dslConfig.entries.forEachIndexed { index, entry ->
        if (entry.collected != null) {
            val expected = entry.collected!!
            val actual = city.productionQueue[index].collectedResources
            ResourceCollection.basic(expected).forEach(true) { type, amount ->
                actual[type] shouldBe amount.plusOrMinus(0.0001f)
            }
        }
    }
}


class ProductionQueueAssertionDsl {
    val entries = mutableListOf<ProductionQueueEntryAssertionDsl>()
    suspend fun entry(block: suspend ProductionQueueEntryAssertionDsl.() -> Unit) {
        entries.add(ProductionQueueEntryAssertionDsl().coApply(block))
    }
}

class ProductionQueueEntryAssertionDsl {
    var building: BuildingType? = null
    var collected: List<ResourceStack>? = null
}