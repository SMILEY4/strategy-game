package io.github.smiley4.strategygame.backend.commondata

sealed interface WorldObject {
    val id: Id
    var tile: TileRef
    var country: Country.Id
    var maxMovement: Int
    var viewDistance: Int


    @JvmInline
    value class Id(val value: String) {
        companion object {}
    }

    class Scout(
        override val id: Id,
        override var tile: TileRef,
        override var country: Country.Id,
        override var maxMovement: Int,
        override var viewDistance: Int,
    ) : WorldObject

    class Settler(
        override val id: Id,
        override var tile: TileRef,
        override var country: Country.Id,
        override var maxMovement: Int,
        override var viewDistance: Int,
    ) : WorldObject

}
