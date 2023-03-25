package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueRemoveEntryCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.Province

/**
 * Cancels the given production queue entry
 */
class ProductionQueueRemoveAction(
    private val gameConfig: GameConfig
) {

    fun perform(game: GameExtended, command: Command<ProductionQueueRemoveEntryCommandData>) {
        val city = getCity(game, command)
        val province = getProvince(game, city)
        val entry = getEntry(city, command)
        entry?.also { removeEntry(city, province, it) }
    }

    private fun removeEntry(city: City, province: Province, entry: ProductionQueueEntry) {
        entry.collectedResources.toList().forEach { resource ->
            val amountRefund = resource.second * gameConfig.productionQueueRefundPercentage
            province.resourcesProducedCurrTurn.add(resource.first, amountRefund)
        }
        city.productionQueue.remove(entry)
    }

    private fun getCity(game: GameExtended, command: Command<ProductionQueueRemoveEntryCommandData>): City {
        return game.cities.find { it.cityId == command.data.cityId }!!
    }

    private fun getProvince(game: GameExtended, city: City): Province {
        return game.provinces.find { it.cityIds.contains(city.cityId) }!!
    }

    private fun getEntry(city: City, command: Command<ProductionQueueRemoveEntryCommandData>): ProductionQueueEntry? {
        return city.productionQueue.find { it.entryId == command.data.queueEntryId }
    }

}