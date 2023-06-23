package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Tile

data class InfluenceDirtyTilesData(
    val game: GameExtended,
    val tiles: List<Tile>
)