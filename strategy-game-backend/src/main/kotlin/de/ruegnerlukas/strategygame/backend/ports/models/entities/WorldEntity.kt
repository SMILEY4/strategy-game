package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class WorldEntity(
	val tiles: List<TileEntity>,
	val markers: List<MarkerEntity>,
	val countries: List<CountryEntity>
)