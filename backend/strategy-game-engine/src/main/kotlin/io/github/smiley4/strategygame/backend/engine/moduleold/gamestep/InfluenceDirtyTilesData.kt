package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile


data class InfluenceDirtyTilesData(
    val game: GameExtended,
    val tiles: List<Tile>
)