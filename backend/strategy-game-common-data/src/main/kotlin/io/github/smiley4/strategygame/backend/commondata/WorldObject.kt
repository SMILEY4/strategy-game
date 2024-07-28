package io.github.smiley4.strategygame.backend.commondata

sealed interface WorldObject {
    val id: String
    var tile: TileRef
}

class ScoutWorldObject(
    override val id: String,
    override var tile: TileRef,
) : WorldObject