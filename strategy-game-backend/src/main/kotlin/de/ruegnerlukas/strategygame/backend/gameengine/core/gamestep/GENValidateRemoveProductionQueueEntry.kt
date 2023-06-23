package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.EventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.utils.validations

class GENValidateRemoveProductionQueueEntry(eventSystem: EventSystem) : Logging {

    object Definition : EventNodeDefinition<RemoveProductionQueueEntryOperationData, RemoveProductionQueueEntryOperationData>()


    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerResolveRemoveProductionQueueEntry)
            action { data ->
                val result = validations {
                    mustBeTrue("REMOVE_PRODUCTION_QUEUE_ENTRY.CITY_OWNER") {
                        data.city.countryId == data.country.countryId
                    }
                    mustBeTrue("REMOVE_PRODUCTION_QUEUE_ENTRY.ENTRY_ID") {
                        data.city.productionQueue.filter { it.entryId == data.entryId }.size == 1
                    }
                }
                if (result.isInvalid()) {
                    log().info("Invalid operation ${result.getInvalidCodes()}")
                    eventResultCancel()
                } else {
                    eventResultOk(data)
                }
            }
        }
    }

}