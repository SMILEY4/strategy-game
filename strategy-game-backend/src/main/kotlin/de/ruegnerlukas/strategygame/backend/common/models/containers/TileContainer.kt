package de.ruegnerlukas.strategygame.backend.common.models.containers

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition


class TileContainer() : Collection<Tile> {

    private val tilesList = mutableListOf<Tile>()
    private val tilesById = mutableMapOf<String, Tile>()
    private val tilesByPos = mutableMapOf<Int, Tile>()

    constructor(collection: Collection<Tile>) : this() {
        this.tilesList.addAll(collection)
        collection.forEach {
            tilesById[it.tileId] = it
            tilesByPos[toKey(it.position, tilesList.size)] = it
        }
    }

    fun get(tileId: String): Tile? {
        return tilesById[tileId]
    }

    fun get(pos: TilePosition): Tile? {
        return get(pos.q, pos.r)
    }

    fun get(q: Int, r: Int): Tile? {
        return tilesByPos[toKey(q, r, tilesList.size)]
    }

    private fun toKey(pos: TilePosition, a: Int) = toKey(pos.q, pos.r, a)

    private fun toKey(q: Int, r: Int, a: Int) = q + r * a

    override val size: Int
        get() = tilesList.size

    override fun isEmpty() = tilesList.isEmpty()

    override fun iterator() = tilesList.iterator()

    override fun containsAll(elements: Collection<Tile>) = tilesList.containsAll(elements)

    override fun contains(element: Tile) = tilesList.contains(element)

}