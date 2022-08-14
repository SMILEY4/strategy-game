package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity

data class GameExtendedDTO(
	val turn: Int,
	val countries: List<CountryDTO>,
	val tiles: List<TileDTO>,
	val cities: List<CityDTO>,
) {
	constructor(game: GameExtendedEntity) : this(
		game.game.turn,
		game.countries.map { CountryDTO(it) },
		game.tiles.map { TileDTO(it) },
		game.cities.map { CityDTO(it) }
	)
}