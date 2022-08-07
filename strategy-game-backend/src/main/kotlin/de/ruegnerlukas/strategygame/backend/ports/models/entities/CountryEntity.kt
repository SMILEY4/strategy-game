package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

data class CountryEntity(
	val gameId: String,
	val userId: String,
	val resources: CountryResourcesEntity
) : DbEntity()

data class CountryResourcesEntity(
	var money: Float
)