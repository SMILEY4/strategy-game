package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

/**
 * Adds the given entry to the city's production queue
 */
class ProductionQueueAddAction: Logging {

    fun perform(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>) {
        log().debug("Add production-queue-entry (${command.data.buildingType}) to city ${command.data.cityId}")
        val city = getCity(game, command)
        city.productionQueue.add(buildEntry(command))
    }

    private fun buildEntry(command: Command<ProductionQueueAddEntryCommandData>): ProductionQueueEntry {
        return ProductionQueueEntry(
            entryId = UUID.gen(),
            buildingType = command.data.buildingType,
            collectedResources = ResourceCollection.basic()
        )
    }

    private fun getCity(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>): City {
        return game.cities.find { it.cityId == command.data.cityId }!!
    }

}