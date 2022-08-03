package de.ruegnerlukas.strategygame.backend.ports.models.entities

import com.arangodb.entity.Key

data class CountryEntity(
	@Key val id: String? = null,
	val gameId: String,
	val userId: String,
	val resources: CountryResourcesEntity
)

data class CountryResourcesEntity(
	var money: Float
)