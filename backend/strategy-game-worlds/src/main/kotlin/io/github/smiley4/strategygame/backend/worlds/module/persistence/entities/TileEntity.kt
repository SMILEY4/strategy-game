package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Tile


internal class TileEntity(
    val gameId: String,
    val position: TilePositionEntity,
    val data: TileDataEntity,
    val influences: List<TileInfluenceEntity>,
    val owner: TileOwnerEntity?,
    val discoveredByCountries: Set<String>,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Tile, gameId: String) = TileEntity(
            key = DbId.asDbId(serviceModel.tileId),
            gameId = gameId,
            position = TilePositionEntity.of(serviceModel.position),
            data = TileDataEntity.of(serviceModel.data),
            influences = serviceModel.influences.map { TileInfluenceEntity.of(it) },
            owner = serviceModel.owner?.let { TileOwnerEntity.of(it) },
            discoveredByCountries = serviceModel.discoveredByCountries,
        )
    }

    fun asServiceModel() = Tile(
        tileId = this.getKeyOrThrow(),
        position = this.position.asServiceModel(),
        data = this.data.asServiceModel(),
        influences = this.influences.map { it.asServiceModel() }.toMutableList(),
        owner = this.owner?.asServiceModel(),
        discoveredByCountries = this.discoveredByCountries.toMutableSet(),
    )

}

