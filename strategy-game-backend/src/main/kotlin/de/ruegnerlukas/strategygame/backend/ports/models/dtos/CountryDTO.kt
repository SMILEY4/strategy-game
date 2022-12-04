package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.shared.RGBColor

class CountryDTO(
    val dataTier1: CountryDTODataTier1,
)

/**
 * Data available to everyone who has discovered the country
 */
data class CountryDTODataTier1(
    val countryId: String,
    val userId: String,
    val color: RGBColor
)