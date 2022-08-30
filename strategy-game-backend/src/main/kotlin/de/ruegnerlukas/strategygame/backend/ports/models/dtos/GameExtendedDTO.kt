package de.ruegnerlukas.strategygame.backend.ports.models.dtos

data class GameExtendedDTO(
	val turn: Int,
	val tiles: List<TileDTO>,
	val countries: List<CountryDTO>,
	val provinces: List<ProvinceDTO>,
	val cities: List<CityDTO>,
)