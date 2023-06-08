package de.ruegnerlukas.strategygame.backend.gameengine.core

/**
 * Updates the entries in production queues
 */
class ProductionQueueUpdateAction(private val turnUpdateAction: TurnUpdateAction) : Logging {

    suspend fun perform(game: GameExtended) {
        log().debug("Update production queue entries")
        game.cities.forEach { update(game, it) }
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
        turnUpdateAction.eventCreateBuilding(
            game,
            BuildingCreationAction.Companion.BuildingCreationData(
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