package io.github.smiley4.strategygame.backend.commondata

data class Tile(
    val tileId: String,
    val position: TilePosition,
    val data: TileData,
    val influences: MutableList<TileInfluence>,
    var owner: TileOwner?,
    val discoveredByCountries: MutableSet<String>,
) {

    inline fun <reified T : WorldObject> findObjects(game: GameExtended): List<T> = game.worldObjects.filter { it.tile.id == tileId }.filterIsInstance<T>()

    inline fun <reified T : WorldObject> findOneObject(game: GameExtended): T? = findObjects<T>(game).firstOrNull()

}
