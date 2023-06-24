package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

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
 * Data available to owner of the country
 */
data class CountryDTODataTier3(
    val availableSettlers: Int
)