package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Settlement


internal class ProvinceEntity(
    val gameId: String,
    val settlementIds: Set<String>,
    val color: ColorEntity,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Province, gameId: String) = ProvinceEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            settlementIds = serviceModel.settlements.map { it.value }.toSet(),
            color = ColorEntity.of(serviceModel.color)
        )

    }

    fun asServiceModel() = Province(
        id = Province.Id(this.getKeyOrThrow()),
        settlements = this.settlementIds.map { Settlement.Id(it) }.toMutableSet(),
        color = this.color.toRGBColor()
    )

}
