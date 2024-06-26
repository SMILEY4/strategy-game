package io.github.smiley4.strategygame.backend.engine.module.core.gamestep

import io.github.smiley4.strategygame.backend.common.detaillog.FloatDetailLogValue
import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.engine.core.eco.ledger.ResourceLedgerDetailType
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.engine.ports.models.Province


/**
 * Cancels the given production queue entry and refunds resources
 */
class GENRemoveProductionQueueEntry(private val gameConfig: GameConfig, eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<RemoveProductionQueueEntryOperationData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENValidateRemoveProductionQueueEntry.Definition.after())
            action { data ->
                log().debug("Canceling production-queue-entry ${data.entryId} in city ${data.city.cityId}")
                val entry = data.city.findProductionQueueEntry(data.entryId)
                removeEntry(data.city, data.province, entry)
                eventResultOk(Unit)
            }
        }
    }

    private fun removeEntry(city: City, province: Province, entry: ProductionQueueEntry) {
        province.resourceLedger.recordProduce(entry.collectedResources.copy().scale(gameConfig.productionQueueRefundPercentage)) { _, amount ->
            ResourceLedgerDetailType.PRODUCTION_QUEUE_REFUND to mutableMapOf("amount" to FloatDetailLogValue(amount))
        }
        city.infrastructure.productionQueue.remove(entry)
    }

}