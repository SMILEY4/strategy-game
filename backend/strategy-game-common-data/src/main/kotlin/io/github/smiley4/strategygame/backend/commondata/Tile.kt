package io.github.smiley4.strategygame.backend.commondata

data class Tile(
    val id: Id,
    val position: Position,
    val discoveredBy: MutableSet<Realm.Id>,
    val dataWorld: WorldData,
) {

    @JvmInline
    value class Id(val value: String) {
        companion object
    }

    data class Ref(val id: Id, val position: Position) {
        constructor(tile: Tile) : this(tile.id, tile.position)
    }

    fun ref() = Ref(this)

    data class Position(val q: Int, val r: Int) {
        constructor(pos: Position) : this(pos.q, pos.r)
        constructor(ref: Ref) : this(ref.position.q, ref.position.r)
    }

    data class WorldData(
        var terrainType: TerrainType,
        var resourceType: TileResourceType,
        var height: Float,
    )

}