package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Tile


data class CreateCityOperationData(
    val game: GameExtended,
    val country: Country,
    val targetName: String,
    val targetTile: Tile,
    val withNewProvince: Boolean
)