package io.github.smiley4.strategygame.backend.commondata

data class Tile(
    val id: Id,
    val position: Position,
    val discoveredBy: MutableSet<Realm.Id>,
    val dataWorld: WorldData,
    val metaProperties: MetaProperties,
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
        var resourceType: ResourceType,
        var height: Float,
    )

    data class MetaProperties(
        val seed: Long
    )

    class Container() : Collection<Tile> {

        private val tilesList = mutableListOf<Tile>()
        private val tilesById = mutableMapOf<Tile.Id, Tile>()
        private val tilesByPos = mutableMapOf<Int, Tile>()

        constructor(collection: Collection<Tile>) : this() {
            this.tilesList.addAll(collection)
            collection.forEach {
                tilesById[it.id] = it
                tilesByPos[toKey(it.position, tilesList.size)] = it
            }
        }

        fun get(tileId: Tile.Id): Tile? {
            return tilesById[tileId]
        }

        fun get(pos: Tile.Position): Tile? {
            return get(pos.q, pos.r)
        }

        fun get(q: Int, r: Int): Tile? {
            return tilesByPos[toKey(q, r, tilesList.size)]
        }

        fun get(ref: Tile.Ref): Tile? {
            return get(ref.id)
        }

        private fun toKey(pos: Tile.Position, a: Int) = toKey(pos.q, pos.r, a)

        private fun toKey(q: Int, r: Int, a: Int) = q + r * a

        override val size: Int
            get() = tilesList.size

        override fun isEmpty() = tilesList.isEmpty()

        override fun iterator() = tilesList.iterator()

        override fun containsAll(elements: Collection<Tile>) = tilesList.containsAll(elements)

        override fun contains(element: Tile) = tilesList.contains(element)

    }

}