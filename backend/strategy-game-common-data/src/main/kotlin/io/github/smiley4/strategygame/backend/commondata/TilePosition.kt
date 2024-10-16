package io.github.smiley4.strategygame.backend.commondata


data class TilePosition(
    var q: Int,
    var r: Int
) {
    constructor(pos: TilePosition) : this(pos.q, pos.r)
    constructor(ref: TileRef) : this(ref.q, ref.r)
}
