package de.ruegnerlukas.strategygame.backend.ports.models

import de.ruegnerlukas.strategygame.backend.shared.TrackingList


data class GameExtended(
    val game: Game,
    val tiles: List<Tile>,
    val countries: List<Country>,
    val cities: TrackingList<City>,
    val provinces: TrackingList<Province>
)