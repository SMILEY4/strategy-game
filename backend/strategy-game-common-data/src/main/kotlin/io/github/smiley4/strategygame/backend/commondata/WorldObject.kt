package io.github.smiley4.strategygame.backend.commondata

sealed interface WorldObject {
    val id: String
    var tile: TileRef
    var country: String
    var maxMovement: Int
}

class ScoutWorldObject(
    override val id: String,
    override var tile: TileRef,
    override var country: String,
    override var maxMovement: Int,
) : WorldObject