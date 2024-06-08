package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.common.utils.UUID
import io.github.smiley4.strategygame.backend.engine.ports.models.BuildingProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.ports.models.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.ports.models.SettlerProductionQueueEntry


/**
 * Adds the given entry to the city's production queue
 */
class GENAddProductionQueueEntry(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<AddProductionQueueEntryOperationData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENValidateAddProductionQueueEntry.Definition.after())
            action { data ->
                log().info("Add production-queue-entry to city ${data.city.cityId}")
                data.city.infrastructure.productionQueue.add(buildEntry(data))
                eventResultOk(Unit)
            }
        }
    }

    private fun buildEntry(data: AddProductionQueueEntryOperationData): ProductionQueueEntry {
        return when (data.entry) {
            is BuildingProductionQueueEntryData -> BuildingProductionQueueEntry(
                entryId = UUID.gen(),
                buildingType = data.entry.buildingType,
                collectedResources = ResourceCollection.basic()
            )
            is SettlerProductionQueueEntryData -> SettlerProductionQueueEntry(
                entryId = UUID.gen(),
                collectedResources = ResourceCollection.basic()
            )
        }
    }

}