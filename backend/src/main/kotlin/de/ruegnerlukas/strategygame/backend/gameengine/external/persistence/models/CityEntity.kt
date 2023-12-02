package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLog
import de.ruegnerlukas.strategygame.backend.common.detaillog.entity.DetailLogEntryEntity
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.common.utils.mapMutable
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityInfrastructure
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityMetadata
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityPopulation
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityPopulationGrowthDetailType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlementTier

class CityEntity(
    val gameId: String,
    val countryId: String,
    val tile: TileRefEntity,
    val tier: String,
    val name: String,
    val color: ColorEntity,
    val isProvinceCapital: Boolean,
    val buildings: List<BuildingEntity>,
    val productionQueue: List<ProductionQueueEntryEntity>,
    val size: Int,
    val growthProgress: Float,
    val growthDetails: List<DetailLogEntryEntity<CityPopulationGrowthDetailType>>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: City, gameId: String) = CityEntity(
            key = DbId.asDbId(serviceModel.cityId),
            gameId = gameId,
            countryId = serviceModel.countryId,
            tile = TileRefEntity.of(serviceModel.tile),
            tier = serviceModel.tier.name,
            name = serviceModel.meta.name,
            color = ColorEntity.of(serviceModel.meta.color),
            isProvinceCapital = serviceModel.meta.isProvinceCapital,
            buildings = serviceModel.infrastructure.buildings.map { BuildingEntity.of(it) },
            productionQueue = serviceModel.infrastructure.productionQueue.map { ProductionQueueEntryEntity.of(it) },
            size = serviceModel.population.size,
            growthProgress = serviceModel.population.growthProgress,
            growthDetails = serviceModel.population.growthDetailLog.getDetails().map { DetailLogEntryEntity.of(it) }
        )
    }

    fun asServiceModel() = City(
        cityId = this.getKeyOrThrow(),
        countryId = this.countryId,
        tile = this.tile.asServiceModel(),
        tier = SettlementTier.valueOf(this.tier),
        meta = CityMetadata(
            name = this.name,
            color = this.color.toRGBColor(),
            isProvinceCapital = this.isProvinceCapital,
        ),
        infrastructure = CityInfrastructure(
            buildings = this.buildings.map
            { it.asServiceModel() }.toMutableList(),
            productionQueue = this.productionQueue.map
            { it.asServiceModel() }.toMutableList(),
        ),
        population = CityPopulation(
            size = this.size,
            growthProgress = this.growthProgress,
            growthDetailLog = DetailLog(this.growthDetails.mapMutable { it.asServiceModel() })
        )
    )

}
