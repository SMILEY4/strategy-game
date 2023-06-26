package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainResourceType
import de.ruegnerlukas.strategygame.backend.common.models.terrain.TerrainType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileData

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