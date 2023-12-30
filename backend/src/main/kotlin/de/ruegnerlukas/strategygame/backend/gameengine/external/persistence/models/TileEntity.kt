package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile

class TileEntity(
    val gameId: String,
    val position: TilePositionEntity,
    val data: TileDataEntity,
    val influences: List<TileInfluenceEntity>,
    val owner: TileOwnerEntity?,
    val discoveredByCountries: List<String>,
    val content: List<TileObjectEntity>,
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
            content = serviceModel.objects.map { TileObjectEntity.of(it) },
        )
    }

    fun asServiceModel() = Tile(
        tileId = this.getKeyOrThrow(),
        position = this.position.asServiceModel(),
        data = this.data.asServiceModel(),
        influences = this.influences.map { it.asServiceModel() }.toMutableList(),
        owner = this.owner?.asServiceModel(),
        discoveredByCountries = this.discoveredByCountries.toMutableList(),
        objects = this.content.map { it.asServiceModel() }.toMutableList(),
    )

}

