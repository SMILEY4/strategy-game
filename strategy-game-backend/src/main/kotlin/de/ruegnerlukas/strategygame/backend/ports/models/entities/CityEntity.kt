package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class CityEntity(
	val id: String,
	val countryId: String,
	val tileId: String,
)