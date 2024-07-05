package io.github.smiley4.strategygame.backend.engine.module.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.BuildingProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.SettlerProductionQueueEntry


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
        city.infrastructure.productionQueue.firstOrNull()?.also { update(game, city, it) }
    }

    private suspend fun update(game: GameExtended, city: City, queueEntry: ProductionQueueEntry) {
        if (isCompleted(queueEntry)) {
            log().debug("Complete production-queue-entry ${queueEntry.entryId}")
            city.infrastructure.productionQueue.remove(queueEntry)
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
        city.findCountry(game).availableSettlers++
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