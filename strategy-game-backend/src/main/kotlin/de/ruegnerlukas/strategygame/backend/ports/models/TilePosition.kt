package de.ruegnerlukas.strategygame.backend.ports.models

data class TilePosition(
    var q: Int,
    var r: Int
) {
    constructor(tile: Tile) : this(tile.position.q, tile.position.r)
    constructor(ref: TileRef) : this(ref.q, ref.r)
    constructor(pos: TilePosition) : this(pos.q, pos.r)
}
