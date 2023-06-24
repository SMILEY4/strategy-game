package de.ruegnerlukas.strategygame.backend.common.models


data class GameExtended(
    val meta: GameMeta,
    val tiles: TileContainer,
    val countries: List<Country>,
    val cities: TrackingList<City>,
    val provinces: TrackingList<Province>,
    val routes: TrackingList<Route>,
)