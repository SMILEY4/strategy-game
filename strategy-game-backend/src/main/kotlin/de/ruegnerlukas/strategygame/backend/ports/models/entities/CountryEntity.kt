package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

data class CountryEntity(
	val gameId: String,
	val userId: String,
	val resources: CountryResources
) : DbEntity()

data class CountryResources(
	var money: Float
)