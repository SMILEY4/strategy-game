package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Tile

data class PlaceMarkerOperationData(
    val game: GameExtended,
    val country: Country,
    val targetTile: Tile,
)