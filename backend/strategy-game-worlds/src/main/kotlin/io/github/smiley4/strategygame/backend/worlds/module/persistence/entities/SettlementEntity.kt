package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Settlement


internal class SettlementEntity(
    val gameId: String,
    val countryId: String,
    val tile: TileRefEntity,
    val name: String,
    val viewDistance: Int,
    val color: ColorEntity,
//    val tier: String,
//    val color: ColorEntity,
//    val isProvinceCapital: Boolean,
//    val buildings: List<BuildingEntity>,
//    val productionQueue: List<ProductionQueueEntryEntity>,
//    val size: Int,
//    val growthProgress: Float,
//    val growthDetails: List<DetailLogEntryEntity<CityPopulationGrowthDetailType>>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Settlement, gameId: String) = SettlementEntity(
            key = DbId.asDbId(serviceModel.settlementId),
            gameId = gameId,
            countryId = serviceModel.countryId,
            tile = TileRefEntity.of(serviceModel.tile),
            name = serviceModel.name,
            viewDistance = serviceModel.viewDistance,
            color = ColorEntity.of(serviceModel.color)
//            tier = serviceModel.tier.name,
//            color = ColorEntity.of(serviceModel.meta.color),
//            isProvinceCapital = serviceModel.meta.isProvinceCapital,
//            buildings = serviceModel.infrastructure.buildings.map { BuildingEntity.of(it) },
//            productionQueue = serviceModel.infrastructure.productionQueue.map { ProductionQueueEntryEntity.of(it) },
//            size = serviceModel.population.size,
//            growthProgress = serviceModel.population.growthProgress,
//            growthDetails = serviceModel.population.growthDetailLog.getDetails().map { DetailLogEntryEntity.of(it) }
        )
    }

    fun asServiceModel() = Settlement(
        settlementId = this.getKeyOrThrow(),
        countryId = this.countryId,
        tile = this.tile.asServiceModel(),
        name = this.name,
        viewDistance = this.viewDistance,
        color = this.color.toRGBColor()
//        tier = SettlementTier.valueOf(this.tier),
//        meta = CityMetadata(
//            name = this.name,
//            color = this.color.toRGBColor(),
//            isProvinceCapital = this.isProvinceCapital,
//        ),
//        infrastructure = CityInfrastructure(
//            buildings = this.buildings.map
//            { it.asServiceModel() }.toMutableList(),
//            productionQueue = this.productionQueue.map
//            { it.asServiceModel() }.toMutableList(),
//        ),
//        population = CityPopulation(
//            size = this.size,
//            growthProgress = this.growthProgress,
//            growthDetailLog = DetailLog(this.growthDetails.mapMutable { it.asServiceModel() })
//        )
    )

}
