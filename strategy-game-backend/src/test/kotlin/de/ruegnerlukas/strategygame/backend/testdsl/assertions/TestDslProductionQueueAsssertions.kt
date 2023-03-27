package de.ruegnerlukas.strategygame.backend.testdsl.assertions

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.shared.coApply
import de.ruegnerlukas.strategygame.backend.testdsl.GameTestContext
import de.ruegnerlukas.strategygame.backend.testdsl.accessors.getCities
import io.kotest.matchers.collections.shouldContainExactly

suspend fun GameTestContext.expectProductionQueue(cityId: String, block: suspend ProductionQueueAssertionDsl.() -> Unit) {
    val dslConfig = ProductionQueueAssertionDsl().coApply(block)
    val city = getCities().find { it.cityId == cityId }!!
    city.productionQueue.map { it.buildingType } shouldContainExactly dslConfig.entries.map { it.building }
}


class ProductionQueueAssertionDsl {
    val entries = mutableListOf<ProductionQueueEntryAssertionDsl>()
    suspend fun entry(block: suspend ProductionQueueEntryAssertionDsl.() -> Unit) {
        entries.add(ProductionQueueEntryAssertionDsl().coApply(block))
    }
}

class ProductionQueueEntryAssertionDsl {
    var building: BuildingType? = null
}