package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity

data class GameExtendedDTO(
	val turn: Int,
	val countries: List<CountryDTO>,
	val tiles: List<TileDTO>,
	val cities: List<CityDTO>,
	val provinces: List<ProvinceDTO>
) {
	constructor(game: GameExtendedEntity) : this(
		turn = game.game.turn,
		countries = game.countries.map { CountryDTO(it) },
		tiles = game.tiles.map { TileDTO(it) },
		cities = game.cities.map { CityDTO(it) },
		provinces = game.provinces.map { ProvinceDTO(it) }
	)
}