package io.github.smiley4.strategygame.backend.engine.module.gamestep

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile


data class DeleteMarkerOperationData(
    val game: GameExtended,
    val country: Country,
    val targetTile: Tile,
)