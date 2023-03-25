package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.actions.update.BuildingCreationAction.Companion.BuildingCreationData
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.provided.update.TurnUpdateAction

/**
 * Updates the entries in production queues
 */
class ProductionQueueUpdateAction(private val turnUpdateAction: TurnUpdateAction) {

    suspend fun perform(game: GameExtended) {
        game.cities.forEach { update(game, it) }
    }

    private suspend fun update(game: GameExtended, city: City) {
        city.productionQueue.firstOrNull()?.also { update(game, city, it) }
    }

    private suspend fun update(game: GameExtended, city: City, queueEntry: ProductionQueueEntry) {
        if (isCompleted(queueEntry)) {
            city.productionQueue.remove(queueEntry)
            turnUpdateAction.eventCreateBuilding(
                game,
                BuildingCreationData(
                    city = city,
                    type = queueEntry.buildingType
                )
            )
        } else {
            addMagicResources(queueEntry)
        }
    }

    private fun addMagicResources(queueEntry: ProductionQueueEntry) {
        /*
        TODO: temporary
         -> add some "free" resources to queue to be able to construct in first city with no production buildings yet
         */
        queueEntry.collectedResources.also { collected ->
            queueEntry.getTotalRequiredResources().forEach { required ->
                collected.add(required.type, 1f)
            }
        }
    }

    private fun isCompleted(queueEntry: ProductionQueueEntry): Boolean {
        return queueEntry.collectedResources.let { collected ->
            queueEntry.getTotalRequiredResources().all { required ->
                collected.hasAtLeast(required.type, required.amount)
            }
        }
    }

}