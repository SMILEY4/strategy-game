package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.models.Province

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
                val entry = getEntry(data.city, data.entryId)
                entry?.also { removeEntry(data.city, data.province, it) }
                eventResultOk(Unit)
            }
        }
    }

    private fun removeEntry(city: City, province: Province, entry: ProductionQueueEntry) {
        province.resourcesProducedCurrTurn.add(
            entry.collectedResources.copy().scale(gameConfig.productionQueueRefundPercentage)
        )
        city.productionQueue.remove(entry)
    }

    private fun getEntry(city: City, entryId: String): ProductionQueueEntry? {
        return city.productionQueue.find { it.entryId == entryId }
    }

}