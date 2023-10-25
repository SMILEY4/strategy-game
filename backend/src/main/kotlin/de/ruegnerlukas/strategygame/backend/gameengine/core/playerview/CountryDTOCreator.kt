package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CountryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CountryDTODataTier1
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CountryDTODataTier3

class CountryDTOCreator(private val countryId: String) {

    fun build(country: Country): CountryDTO {
        return CountryDTO(
            dataTier1 = CountryDTODataTier1(
                id = country.countryId,
                name = country.countryId, // todo: store proper name for country
                userId = country.userId,
                userName = country.userId, // todo: get proper name of player
                color = country.color
            ),
            dataTier3 = if (countryId == country.countryId) {
                CountryDTODataTier3(
                    availableSettlers = country.availableSettlers
                )
            } else {
                null
            }
        )
    }

}