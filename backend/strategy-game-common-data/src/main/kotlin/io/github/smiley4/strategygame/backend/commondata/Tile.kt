package io.github.smiley4.strategygame.backend.commondata


data class Tile(
    val tileId: String,
    val position: TilePosition,
    val data: TileData,
    val influences: MutableList<TileInfluence>,
    var owner: TileOwner?,
    val discoveredByCountries: MutableList<String>,
    val objects: MutableList<TileObject>
) {

    inline fun <reified T : TileObject> findObjects(): List<T> = objects.filterIsInstance<T>()

    inline fun <reified T : TileObject> findOneObject(): T? = findObjects<T>().firstOrNull()

}
