package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class ExtGameEntity(
	val id: String,
	val seed: Int,
	val turn: Int,
	val tiles: List<TileEntity>,
	val markers: List<MarkerEntity>,
	val players: List<PlayerEntity>,
	val countries: List<CountryEntity>
)