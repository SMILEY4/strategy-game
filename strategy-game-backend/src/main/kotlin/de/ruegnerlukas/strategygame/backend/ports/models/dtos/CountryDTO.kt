package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor

class CountryDTO(
    val dataTier1: CountryDTODataTier1,
    val dataTier3: CountryDTODataTier3?
)


/**
 * Data available to everyone who has discovered the country
 */
data class CountryDTODataTier1(
    val countryId: String,
    val userId: String,
    val color: RGBColor
)


/**
 * only available to player playing the country
 */
data class CountryDTODataTier3(
    val resources: CountryDTOResources
)


data class CountryDTOResources(
    val money: Float
)