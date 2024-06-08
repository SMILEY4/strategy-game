package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.common.models.Tile


data class InfluenceDirtyTilesData(
    val game: GameExtended,
    val tiles: List<Tile>
)