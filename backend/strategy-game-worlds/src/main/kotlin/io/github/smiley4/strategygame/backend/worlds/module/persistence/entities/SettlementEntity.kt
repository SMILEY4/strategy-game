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
    val productionQueue: List<ProductionQueueEntryEntity>,
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
            color = ColorEntity.of(serviceModel.color),
            productionQueue = serviceModel.productionQueue.map { ProductionQueueEntryEntity.of(it) },
        )
    }

    fun asServiceModel() = Settlement(
        settlementId = this.getKeyOrThrow(),
        countryId = this.countryId,
        tile = this.tile.asServiceModel(),
        name = this.name,
        viewDistance = this.viewDistance,
        color = this.color.toRGBColor(),
        productionQueue = this.productionQueue.map { it.asServiceModel() }.toMutableList()
    )

}
