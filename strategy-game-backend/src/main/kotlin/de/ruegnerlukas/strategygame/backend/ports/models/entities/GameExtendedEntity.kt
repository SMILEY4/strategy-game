package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.shared.TrackingList


data class GameExtendedEntity(
	val game: GameEntity,
	val tiles: List<TileEntity>,
	val countries: List<CountryEntity>,
	val cities: TrackingList<CityEntity>,
)