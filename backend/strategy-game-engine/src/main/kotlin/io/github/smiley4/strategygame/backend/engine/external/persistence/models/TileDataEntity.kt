package io.github.smiley4.strategygame.backend.engine.external.persistence.models

import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainType
import io.github.smiley4.strategygame.backend.common.models.TileData


class TileDataEntity(
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