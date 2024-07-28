package io.github.smiley4.strategygame.backend.commondata


class City(
    val cityId: String,
    val countryId: String,
    val tile: TileRef,
    var tier: SettlementTier,
    val meta: CityMetadata,
    val infrastructure: CityInfrastructure,
    val population: CityPopulation,
) {

    fun findCountry(game: GameExtended): Country = game.findCountry(countryId)

    fun findProvince(game: GameExtended): Province = game.findProvinceByCity(cityId)

    fun findTile(game: GameExtended): Tile = game.findTile(tile.id)

    fun findProductionQueueEntry(entryId: String): ProductionQueueEntry = infrastructure.productionQueue.find { it.entryId == entryId }
        ?: throw Exception("Could not find production-queue-entry $entryId in city $cityId")

}

class CityMetadata(
    val name: String,
    val color: RGBColor,
    val isProvinceCapital: Boolean,
)

class CityInfrastructure(
    val buildings: MutableList<Building>,
    val productionQueue: MutableList<ProductionQueueEntry>,
)

class CityPopulation(
    var size: Int,
    var consumedFood: Float = 0f,
    var growthProgress: Float,
    var growthConsumedFood: Boolean = false,
    var growthDetailLog: DetailLog<CityPopulationGrowthDetailType> = DetailLog()
)

enum class CityPopulationGrowthDetailType {
    MORE_FOOD_AVAILABLE,
    NOT_ENOUGH_FOOD,
    STARVING,
    PROVINCE_CAPITAL,
    MAX_SIZE_REACHED,
}