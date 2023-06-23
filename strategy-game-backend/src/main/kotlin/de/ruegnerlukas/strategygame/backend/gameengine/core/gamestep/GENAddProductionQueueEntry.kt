package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.EventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.SettlerProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.utils.UUID

/**
 * Adds the given entry to the city's production queue
 */
class GENAddProductionQueueEntry(eventSystem: EventSystem) : Logging {

    object Definition : EventNodeDefinition<AddProductionQueueEntryOperationData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENValidateAddProductionQueueEntry.Definition.after())
            action { data ->
                log().debug("Add production-queue-entry  to city ${data.city.cityId}")
                data.city.productionQueue.add(buildEntry(data))
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