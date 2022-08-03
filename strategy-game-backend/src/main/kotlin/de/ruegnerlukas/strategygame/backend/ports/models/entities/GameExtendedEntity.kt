package de.ruegnerlukas.strategygame.backend.ports.models.entities


data class GameExtendedEntity(
	val turn: Int,
	val players: List<OldPlayerEntity>,
	val countries: List<CountryEntity>,
	val tiles: List<TileEntity>,
	val cities: List<CityEntity>,
	val markers: List<MarkerEntity>,
)