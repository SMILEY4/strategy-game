package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Settlement


internal class SettlementEntity(
    val gameId: String,
    val countryId: String,
    val tile: TileRefEntity,
    val name: String,
    val viewDistance: Int,
    val color: ColorEntity,
    val productionQueue: List<ProductionQueueEntryEntity>,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Settlement, gameId: String) = SettlementEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            countryId = serviceModel.country.value,
            tile = TileRefEntity.of(serviceModel.tile),
            name = serviceModel.attributes.name,
            viewDistance = serviceModel.attributes.viewDistance,
            color = ColorEntity.of(serviceModel.attributes.color),
            productionQueue = serviceModel.infrastructure.productionQueue.map { ProductionQueueEntryEntity.of(it) },
        )
    }

    fun asServiceModel() = Settlement(
        id = Settlement.Id(this.getKeyOrThrow()),
        country = Country.Id(this.countryId),
        tile = this.tile.asServiceModel(),
        attributes = Settlement.Attributes(
            name = this.name,
            viewDistance = this.viewDistance,
            color = this.color.toRGBColor(),
        ),
        infrastructure = Settlement.Infrastructure(
            productionQueue = this.productionQueue.map { it.asServiceModel() }.toMutableList(),
            buildings = mutableListOf(), // todo
        ),
    )

}
