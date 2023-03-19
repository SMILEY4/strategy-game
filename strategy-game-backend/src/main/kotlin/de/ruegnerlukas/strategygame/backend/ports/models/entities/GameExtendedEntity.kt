package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.shared.TrackingList


data class GameExtendedEntity(
	val game: GameEntity,
	val countries: List<CountryEntity>,
	val tiles: List<TileEntity>,
	val cities: TrackingList<CityEntity>,
	val provinces: TrackingList<ProvinceEntity>
)