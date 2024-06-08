package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.common.models.Tile


data class CreateCityOperationData(
    val game: GameExtended,
    val country: Country,
    val targetName: String,
    val targetTile: Tile,
    val withNewProvince: Boolean
)