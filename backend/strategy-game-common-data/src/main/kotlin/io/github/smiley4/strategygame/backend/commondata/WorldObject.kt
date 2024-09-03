package io.github.smiley4.strategygame.backend.commondata

sealed interface WorldObject {
    val id: String
    var tile: TileRef
    var country: String
    var maxMovement: Int
    var viewDistance: Int
}

class ScoutWorldObject( // todo: as nested class of WorldObject ? -> WorldObject.Scout(...)
    override val id: String,
    override var tile: TileRef,
    override var country: String,
    override var maxMovement: Int,
    override var viewDistance: Int,
) : WorldObject

class SettlerWorldObject( // todo: as nested class of WorldObject ? -> WorldObject.Settler(...)
    override val id: String,
    override var tile: TileRef,
    override var country: String,
    override var maxMovement: Int,
    override var viewDistance: Int,
) : WorldObject