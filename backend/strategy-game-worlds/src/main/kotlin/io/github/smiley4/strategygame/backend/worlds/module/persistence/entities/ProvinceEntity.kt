package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Province


internal class ProvinceEntity(
    val gameId: String,
    val settlementIds: Set<String>,
    val color: ColorEntity,
    key: String? = null,
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Province, gameId: String) = ProvinceEntity(
            key = DbId.asDbId(serviceModel.provinceId),
            gameId = gameId,
            settlementIds = serviceModel.settlementIds,
            color = ColorEntity.of(serviceModel.color)
        )

    }

    fun asServiceModel() = Province(
        provinceId = this.getKeyOrThrow(),
        settlementIds = this.settlementIds.toMutableSet(),
        color = this.color.toRGBColor()
    )

}
