package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.common.models.TilePosition

data class Tile(
    val tileId: String,
    val position: TilePosition,
    val data: TileData,
    val influences: MutableList<TileInfluence>,
    var owner: TileOwner?,
    val discoveredByCountries: MutableList<String>,
    val content: MutableList<TileContent>
) {

    inline fun <reified T : TileContent> findContent(): List<T> = content.filterIsInstance<T>()

    inline fun <reified T : TileContent> findOneContent(): T? = findContent<T>().firstOrNull()

}
