package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor

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
	val color: RGBColor
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