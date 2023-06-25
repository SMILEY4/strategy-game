package de.ruegnerlukas.strategygame.backend.common.models

data class TilePosition(
    var q: Int,
    var r: Int
) {
    constructor(pos: TilePosition) : this(pos.q, pos.r)
}
