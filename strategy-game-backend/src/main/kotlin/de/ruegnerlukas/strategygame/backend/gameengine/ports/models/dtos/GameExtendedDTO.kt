package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

data class GameExtendedDTO(
    val turn: Int,
    val tiles: List<TileDTO>,
    val countries: List<CountryDTO>,
    val cities: List<CityDTO>,
    val provinces: List<ProvinceDTO>,
    val routes: List<RouteDTO>
)