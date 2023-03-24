package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats

/**
 * Adds the given entry to the city's production queue
 */
class ProductionQueueAddAction {

    fun perform(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>) {
        val city = getCity(game, command)
        city.productionQueue.add(buildEntry(command))
    }

    private fun buildEntry(command: Command<ProductionQueueAddEntryCommandData>): ProductionQueueEntry {
        return ProductionQueueEntry(
            buildingType = command.data.buildingType,
            collectedResources = ResourceStats()
        )
    }

    private fun getCity(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>): City {
        return game.cities.find { it.cityId == command.data.cityId }!!
    }

}