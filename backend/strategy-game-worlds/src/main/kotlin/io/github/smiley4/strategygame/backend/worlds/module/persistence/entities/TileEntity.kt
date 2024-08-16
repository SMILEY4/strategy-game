package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileOwner
import io.github.smiley4.strategygame.backend.commondata.TilePoliticalData
import io.github.smiley4.strategygame.backend.commondata.TileResourceType
import io.github.smiley4.strategygame.backend.commondata.TileWorldData


internal class TileEntity(
    val gameId: String,
    val position: TilePositionEntity,
    val dataWorld: TileWorldDataEntity,
    val dataPolitical: TilePoliticalDataEntity,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Tile, gameId: String) = TileEntity(
            key = DbId.asDbId(serviceModel.tileId),
            gameId = gameId,
            position = TilePositionEntity.of(serviceModel.position),
            dataWorld = TileWorldDataEntity.of(serviceModel.dataWorld),
            dataPolitical = TilePoliticalDataEntity.of(serviceModel.dataPolitical),
        )
    }

    fun asServiceModel() = Tile(
        tileId = this.getKeyOrThrow(),
        position = this.position.asServiceModel(),
        dataWorld = this.dataWorld.asServiceModel(),
        dataPolitical = this.dataPolitical.asServiceModel()
    )

}


internal class TileWorldDataEntity(
    val terrainType: TerrainType,
    val resourceType: TileResourceType,
    val height: Float,
) {

    companion object {
        fun of(serviceModel: TileWorldData) = TileWorldDataEntity(
            terrainType = serviceModel.terrainType,
            resourceType = serviceModel.resourceType,
            height = serviceModel.height
        )
    }

    fun asServiceModel() = TileWorldData(
        terrainType = this.terrainType,
        resourceType = this.resourceType,
        height = this.height
    )
}


internal class TilePoliticalDataEntity(
    val influences: List<TileInfluenceEntity>,
    val discoveredByCountries: Set<String>,
    val controlledBy: TileOwnerEntity?
) {

    companion object {
        fun of(serviceModel: TilePoliticalData) = TilePoliticalDataEntity(
            influences = serviceModel.influences.map { TileInfluenceEntity.of(it) },
            discoveredByCountries = serviceModel.discoveredByCountries,
            controlledBy = serviceModel.controlledBy?.let { TileOwnerEntity.of(it) }
        )
    }

    fun asServiceModel() = TilePoliticalData(
        influences = this.influences.map { it.asServiceModel() }.toMutableList(),
        discoveredByCountries = this.discoveredByCountries.toMutableSet(),
        controlledBy = this.controlledBy?.asServiceModel()
    )
}

internal data class TileOwnerEntity(
    val countryId: String,
    val provinceId: String,
    val settlementId: String
) {

    companion object {
        fun of(serviceModel: TileOwner) = TileOwnerEntity(
            countryId = serviceModel.countryId,
            provinceId = serviceModel.provinceId,
            settlementId = serviceModel.settlementId
        )
    }

    fun asServiceModel() = TileOwner(
        countryId = this.countryId,
        provinceId = this.provinceId,
        settlementId = this.settlementId
    )

}