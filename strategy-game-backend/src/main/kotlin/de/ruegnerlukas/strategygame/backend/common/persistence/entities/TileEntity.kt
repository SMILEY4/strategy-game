package de.ruegnerlukas.strategygame.backend.common.persistence.entities

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileData
import de.ruegnerlukas.strategygame.backend.common.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.common.models.TileOwner
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity

class TileEntity(
    val gameId: String,
    val position: TilePosition,
    val data: TileData,
    val influences: List<TileInfluence>,
    val owner: TileOwner?,
    val discoveredByCountries: List<String>,
    val content: List<TileEntityContent>,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Tile, gameId: String) = TileEntity(
            key = DbId.asDbId(serviceModel.tileId),
            gameId = gameId,
            position = serviceModel.position,
            data = serviceModel.data,
            influences = serviceModel.influences,
            owner = serviceModel.owner,
            discoveredByCountries = serviceModel.discoveredByCountries,
            content = serviceModel.content.map { TileEntityContent.of(it) },
        )
    }

    fun asServiceModel() = Tile(
        tileId = this.getKeyOrThrow(),
        position = this.position,
        data = this.data,
        influences = this.influences.toMutableList(),
        owner = this.owner,
        discoveredByCountries = this.discoveredByCountries.toMutableList(),
        content = this.content.map { it.asServiceModel() }.toMutableList(),
    )

}

