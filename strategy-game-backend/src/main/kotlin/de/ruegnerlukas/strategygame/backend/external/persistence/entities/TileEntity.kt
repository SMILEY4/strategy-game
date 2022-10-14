package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileContent
import de.ruegnerlukas.strategygame.backend.ports.models.TileData
import de.ruegnerlukas.strategygame.backend.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition

class TileEntity(
    val gameId: String,
    val position: TilePosition,
    val data: TileData,
    val influences: List<TileInfluence>,
    val owner: TileOwner?,
    val discoveredByCountries: List<String>,
    val content: List<TileContent>,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Tile) = TileEntity(
            key = DbId.asDbId(serviceModel.tileId),
            gameId = serviceModel.gameId,
            position = serviceModel.position,
            data = serviceModel.data,
            influences = serviceModel.influences,
            owner = serviceModel.owner,
            discoveredByCountries = serviceModel.discoveredByCountries,
            content = serviceModel.content,
        )
    }

    fun asServiceModel() = Tile(
        tileId = this.getKeyOrThrow(),
        gameId = this.gameId,
        position = this.position,
        data = this.data,
        influences = this.influences.toMutableList(),
        owner = this.owner,
        discoveredByCountries = this.discoveredByCountries.toMutableList(),
        content = this.content.toMutableList(),
    )

}

