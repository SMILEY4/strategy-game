package io.github.smiley4.strategygame.backend.commondata

data class GameState(
    val game: Game,
    val tiles: TileContainer,
    val realms: TrackingList<Realm>,
    val worldObjects: TrackingList<WorldObject>,
)
