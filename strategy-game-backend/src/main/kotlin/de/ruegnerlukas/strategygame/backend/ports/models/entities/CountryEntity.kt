package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class CountryEntity(
	val id: String,
	val gameId: String,
	val amountMoney: Float
)