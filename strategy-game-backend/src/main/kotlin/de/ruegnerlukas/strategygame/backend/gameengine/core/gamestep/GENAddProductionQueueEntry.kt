package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlerProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.utils.UUID

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