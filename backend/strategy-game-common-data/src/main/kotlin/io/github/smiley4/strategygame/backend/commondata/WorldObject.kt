package io.github.smiley4.strategygame.backend.commondata

sealed interface WorldObject {
    val id: String
    val tile: TileRef
}

class ScoutWorldObject(
    override val id: String,
    override val tile: TileRef,
) : WorldObject