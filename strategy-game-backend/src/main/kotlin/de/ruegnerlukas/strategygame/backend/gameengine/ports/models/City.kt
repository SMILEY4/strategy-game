package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

class City(
    val cityId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val isProvinceCapital: Boolean,
    val buildings: MutableList<Building>,
    val productionQueue: MutableList<ProductionQueueEntry>,
    var size: Int,
    var growthProgress: Float,
    var popConsumedFood: Float = 0f,
    var popGrowthConsumedFood: Boolean = false
) {

    fun findCountry(game: GameExtended): Country = game.findCountry(countryId)

    fun findProvince(game: GameExtended): Province = game.findProvinceByCity(cityId)

    fun findTile(game: GameExtended): Tile = game.findTile(tile.tileId)

    fun findProductionQueueEntry(entryId: String): ProductionQueueEntry = productionQueue.find { it.entryId == entryId }
        ?: throw Exception("Could not find production-queue-entry $entryId in city $cityId")

}