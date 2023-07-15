package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CountryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CountryDTODataTier1
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CountryDTODataTier3

class CountryDTOCreator(private val countryId: String) {

    fun build(country: Country): CountryDTO {
        val dataTier1 = CountryDTODataTier1(
            countryId = country.countryId,
            userId = country.userId,
            color = country.color
        )
        val dataTier3 = if (countryId == country.countryId) {
            CountryDTODataTier3(
                availableSettlers = country.availableSettlers
            )
        } else {
            null
        }
        return CountryDTO(
            dataTier1 = dataTier1,
            dataTier3 = dataTier3
        )
    }

}