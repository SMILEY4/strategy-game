package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

class CountryDTO(
    override val dataTier0: Unit = Unit,
    override val dataTier1: CountryDTODataTier1,
    override val dataTier2: Unit = Unit,
    override val dataTier3: CountryDTODataTier3?
) : TieredDTO<Unit, CountryDTODataTier1, Unit, CountryDTODataTier3?>


/**
 * Data available to everyone who has discovered the country
 */
data class CountryDTODataTier1(
    val id: String,
    val name: String,
    val userId: String,
    val userName: String,
    val color: RGBColor
)


/**
 * Data available to owner of the country
 */
data class CountryDTODataTier3(
    val availableSettlers: Int
)
