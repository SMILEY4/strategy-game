package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.shared.TrackingList


data class GameExtended(
    val game: Game,
    val tiles: TileContainer,
    val countries: List<Country>,
    val cities: TrackingList<City>,
    val provinces: TrackingList<Province>,
    val routes: TrackingList<Route>
)