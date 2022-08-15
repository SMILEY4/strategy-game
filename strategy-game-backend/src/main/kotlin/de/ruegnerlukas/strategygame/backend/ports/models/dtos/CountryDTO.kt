package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity

class CountryDTO(
	val countryId: String,
	val userId: String,
	val resources: CountryDTOResources
) {
	constructor(country: CountryEntity) : this(
		countryId = country.key!!,
		userId = country.userId,
		resources = CountryDTOResources(country.resources.money)
	)
}

data class CountryDTOResources(
	val money: Float
)