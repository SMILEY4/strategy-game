package de.ruegnerlukas.strategygame.backend.common.models

import de.ruegnerlukas.strategygame.backend.common.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.common.TrackingList


data class GameExtended(
    val game: Game,
    val tiles: TileContainer,
    val countries: List<Country>,
    val cities: TrackingList<City>,
    val provinces: TrackingList<Province>,
    val routes: TrackingList<Route>,
)