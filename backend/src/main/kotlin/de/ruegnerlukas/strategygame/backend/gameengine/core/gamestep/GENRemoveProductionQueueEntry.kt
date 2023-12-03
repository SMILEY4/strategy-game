package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.detaillog.FloatDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.ResourceLedgerDetailType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province

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