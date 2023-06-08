package de.ruegnerlukas.strategygame.backend.gameengine.core

/**
 * Cancels the given production queue entry
 */
class ProductionQueueRemoveAction(private val gameConfig: GameConfig): Logging {

    fun perform(game: GameExtended, command: Command<ProductionQueueRemoveEntryCommandData>) {
        log().debug("Remove production-queue-entry (${command.data.queueEntryId}) from city ${command.data.cityId}")
        val city = getCity(game, command)
        val province = getProvince(game, city)
        val entry = getEntry(city, command)
        entry?.also { removeEntry(city, province, it) }
    }

    private fun removeEntry(city: City, province: Province, entry: ProductionQueueEntry) {
        province.resourcesProducedCurrTurn.add(
            entry.collectedResources.copy().scale(gameConfig.productionQueueRefundPercentage)
        )
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