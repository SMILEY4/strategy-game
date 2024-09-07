package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileResourceType


internal class TileEntity(
    val gameId: String,
    val position: TilePositionEntity,
    val dataWorld: TileWorldDataEntity,
    val dataPolitical: TilePoliticalDataEntity,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Tile, gameId: String) = TileEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            position = TilePositionEntity.of(serviceModel.position),
            dataWorld = TileWorldDataEntity.of(serviceModel.dataWorld),
            dataPolitical = TilePoliticalDataEntity.of(serviceModel.dataPolitical),
        )
    }

    fun asServiceModel() = Tile(
        id = Tile.Id(this.getKeyOrThrow()),
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
        fun of(serviceModel: Tile.WorldData) = TileWorldDataEntity(
            terrainType = serviceModel.terrainType,
            resourceType = serviceModel.resourceType,
            height = serviceModel.height
        )
    }

    fun asServiceModel() = Tile.WorldData(
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
        fun of(serviceModel: Tile.PoliticalData) = TilePoliticalDataEntity(
            influences = serviceModel.influences.map { TileInfluenceEntity.of(it) },
            discoveredByCountries = serviceModel.discoveredByCountries.map { it.value }.toSet(),
            controlledBy = serviceModel.controlledBy?.let { TileOwnerEntity.of(it) }
        )
    }

    fun asServiceModel() = Tile.PoliticalData(
        influences = this.influences.map { it.asServiceModel() }.toMutableList(),
        discoveredByCountries = this.discoveredByCountries.map { Country.Id(it) }.toMutableSet(),
        controlledBy = this.controlledBy?.asServiceModel()
    )
}

internal data class TileOwnerEntity(
    val countryId: String,
    val provinceId: String,
    val settlementId: String
) {

    companion object {
        fun of(serviceModel: Tile.Owner) = TileOwnerEntity(
            countryId = serviceModel.country.value,
            provinceId = serviceModel.province.value,
            settlementId = serviceModel.settlement.value
        )
    }

    fun asServiceModel() = Tile.Owner(
        country = Country.Id(this.countryId),
        province = Province.Id(this.provinceId),
        settlement = Settlement.Id(this.settlementId)
    )

}