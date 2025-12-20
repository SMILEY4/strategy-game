package io.github.smiley4.strategygame.backend.commondata

import io.github.smiley4.strategygame.backend.commondata.utils.TrackingList

data class GameState(
    val game: Game,
    val tiles: Tile.Container,
    val realms: TrackingList<Realm>,
    val worldObjects: TrackingList<WorldObject>,
    val routes: TrackingList<Route>,
)
