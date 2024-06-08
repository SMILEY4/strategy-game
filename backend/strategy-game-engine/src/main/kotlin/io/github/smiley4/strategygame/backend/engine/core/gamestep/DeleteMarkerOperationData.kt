package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.common.models.Tile


data class DeleteMarkerOperationData(
    val game: GameExtended,
    val country: Country,
    val targetTile: Tile,
)