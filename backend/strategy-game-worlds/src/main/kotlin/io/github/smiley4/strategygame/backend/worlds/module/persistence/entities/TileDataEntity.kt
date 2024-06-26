package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.TerrainResourceType
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.TileData


internal class TileDataEntity(
    val terrainType: TerrainType,
    val resourceType: TerrainResourceType,
) {

    companion object {
        fun of(serviceModel: TileData) = TileDataEntity(
            terrainType = serviceModel.terrainType,
            resourceType = serviceModel.resourceType
        )
    }

    fun asServiceModel() = TileData(
        terrainType = this.terrainType,
        resourceType = this.resourceType
    )
}