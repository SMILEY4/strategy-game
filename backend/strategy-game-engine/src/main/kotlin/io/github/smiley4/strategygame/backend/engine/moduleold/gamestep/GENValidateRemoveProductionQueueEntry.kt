package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.EventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.validations


class GENValidateRemoveProductionQueueEntry(eventSystem: EventSystem) : Logging {

    object Definition :
        EventNodeDefinition<RemoveProductionQueueEntryOperationData, RemoveProductionQueueEntryOperationData, OperationInvalidData, Unit>()


    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerResolveRemoveProductionQueueEntry)
            action { data ->
                val result = validations {
                    mustBeTrue("REMOVE_PRODUCTION_QUEUE_ENTRY.CITY_OWNER") {
                        data.city.countryId == data.country.countryId
                    }
                    mustBeTrue("REMOVE_PRODUCTION_QUEUE_ENTRY.ENTRY_ID") {
                        data.city.infrastructure.productionQueue.filter { it.entryId == data.entryId }.size == 1
                    }
                }
                if (result.isInvalid()) {
                    log().info("Invalid operation ${result.getInvalidCodes()}")
                    eventResultCancel(OperationInvalidData(data.game, result.getInvalidCodes()))
                } else {
                    eventResultOk(data)
                }
            }
        }
    }

}