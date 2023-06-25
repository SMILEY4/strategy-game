package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlerProductionQueueEntry

/**
 * Updates the entries in production queues
 */
class GENUpdateProductionQueue(private val eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<GameExtended, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENUpdateEconomy.Definition.after())
            action { game ->
                log().debug("Update production queue entries")
                game.cities.forEach { update(game, it) }
                eventResultOk(Unit)
            }
        }
    }

    private suspend fun update(game: GameExtended, city: City) {
        city.productionQueue.firstOrNull()?.also { update(game, city, it) }
    }

    private suspend fun update(game: GameExtended, city: City, queueEntry: ProductionQueueEntry) {
        if (isCompleted(queueEntry)) {
            log().debug("Complete production-queue-entry ${queueEntry.entryId}")
            city.productionQueue.remove(queueEntry)
            when (queueEntry) {
                is BuildingProductionQueueEntry -> apply(game, city, queueEntry)
                is SettlerProductionQueueEntry -> apply(game, city, queueEntry)
            }
        } else {
            addMagicResources(queueEntry)
        }
    }

    private suspend fun apply(game: GameExtended, city: City, entry: BuildingProductionQueueEntry) {
        eventSystem.publish(
            TriggerCreateBuilding, CreateBuildingData(
                game = game,
                city = city,
                type = entry.buildingType
            )
        )
    }

    private fun apply(game: GameExtended, city: City, entry: SettlerProductionQueueEntry) {
        game.countries.find { it.countryId == city.countryId }?.also { country ->
            country.availableSettlers++
        }
    }

    private fun addMagicResources(queueEntry: ProductionQueueEntry) {
        /*
        TODO: temporary
         -> add some "free" resources to queue to be able to construct in first city with no production buildings yet
         */
        queueEntry.collectedResources.also { collected ->
            queueEntry.getTotalRequiredResources().copy()
                .sub(queueEntry.collectedResources)
                .forEach { requiredType, _ ->
                    collected.add(requiredType, 1f)
                }
        }
    }

    private fun isCompleted(queueEntry: ProductionQueueEntry): Boolean {
        return queueEntry.getTotalRequiredResources().all { requiredType, requiredAmount ->
            queueEntry.collectedResources.hasAtLeast(requiredType, requiredAmount)
        }
    }

}