package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.TileResourceType
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.TileData


internal class TileDataEntity(
    val terrainType: TerrainType,
    val resourceType: TileResourceType,
    val height: Float,
) {

    companion object {
        fun of(serviceModel: TileData) = TileDataEntity(
            terrainType = serviceModel.terrainType,
            resourceType = serviceModel.resourceType,
            height = serviceModel.height
        )
    }

    fun asServiceModel() = TileData(
        terrainType = this.terrainType,
        resourceType = this.resourceType,
        height = this.height
    )
}