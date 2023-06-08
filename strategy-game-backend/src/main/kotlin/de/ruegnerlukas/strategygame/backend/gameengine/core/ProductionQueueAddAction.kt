package de.ruegnerlukas.strategygame.backend.gameengine.core

/**
 * Adds the given entry to the city's production queue
 */
class ProductionQueueAddAction : Logging {

    fun perform(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>) {
        log().debug("Add production-queue-entry (${command.data::class.simpleName}) to city ${command.data.cityId}")
        val city = getCity(game, command)
        city.productionQueue.add(buildEntry(command))
    }

    private fun buildEntry(command: Command<ProductionQueueAddEntryCommandData>): ProductionQueueEntry {
        return when (command.data) {
            is ProductionQueueAddBuildingEntryCommandData -> BuildingProductionQueueEntry(
                entryId = UUID.gen(),
                buildingType = command.data.buildingType,
                collectedResources = ResourceCollection.basic()
            )
            is ProductionQueueAddSettlerEntryCommandData -> SettlerProductionQueueEntry(
                entryId = UUID.gen(),
                collectedResources = ResourceCollection.basic()
            )
        }
    }

    private fun getCity(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>): City {
        return game.cities.find { it.cityId == command.data.cityId }!!
    }

}