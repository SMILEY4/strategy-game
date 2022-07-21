package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class WorldExtendedEntity(
	val id: String,
	val players: List<PlayerEntity>,
	val tiles: List<TileEntity>,
	val cities: List<CityEntity>,
	val countries: List<CountryEntity>
)