package de.ruegnerlukas.strategygame.backend.ports.models.dtos

class CountryDTO(
    val baseData: CountryDTOBaseData,
	val advancedData: CountryDTOAdvancedData?
)


/**
 * Data available to everyone who has discovered the country
 */
data class CountryDTOBaseData(
	val countryId: String,
	val userId: String,
)


/**
 * only available to player playing the country
 */
data class CountryDTOAdvancedData(
	val resources: CountryDTOResources
)


data class CountryDTOResources(
    val money: Float
)