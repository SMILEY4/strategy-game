package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class CountryEntity(
	val id: String,
	val playerId: String,
	val amountMoney: Float
)