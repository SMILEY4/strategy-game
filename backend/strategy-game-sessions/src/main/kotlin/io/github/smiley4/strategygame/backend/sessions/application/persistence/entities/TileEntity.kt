package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.ResourceNode
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.utils.DbId


internal class TileEntity(
    val gameId: String,
    val discoveredBy: Set<String>,
    val position: TilePositionEntity,
    val dataWorld: TileWorldDataEntity,
    val seed: Long,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Tile, gameId: String) = TileEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            position = TilePositionEntity.of(serviceModel.position),
            dataWorld = TileWorldDataEntity.of(serviceModel.dataWorld),
            discoveredBy = serviceModel.discoveredBy.map { it.value }.toSet(),
            seed = serviceModel.metaProperties.seed
        )
    }

    fun asServiceModel() = Tile(
        id = Tile.Id(this.getKeyOrThrow()),
        position = this.position.asServiceModel(),
        dataWorld = this.dataWorld.asServiceModel(),
        discoveredBy = this.discoveredBy.map { Realm.Id(it) }.toMutableSet(),
        metaProperties = Tile.MetaProperties(
            seed = this.seed
        )
    )

}

internal class TileWorldDataEntity(
    val terrainType: TerrainType,
    val resources: List<ResourceNode>,
    val height: Float,
) {

    companion object {
        fun of(serviceModel: Tile.WorldData) = TileWorldDataEntity(
            terrainType = serviceModel.terrainType,
            resources = serviceModel.resources,
            height = serviceModel.height
        )
    }

    fun asServiceModel() = Tile.WorldData(
        terrainType = this.terrainType,
        resources = this.resources.toMutableList(),
        height = this.height
    )
}
