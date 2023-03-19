package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.shared.RGBColor

class CountryEntity(
    val gameId: String,
    val userId: String,
    val color: RGBColor,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Country, gameId: String) = CountryEntity(
            key = DbId.asDbId(serviceModel.countryId),
            gameId = gameId,
            userId = serviceModel.userId,
            color = serviceModel.color,
        )
    }

    fun asServiceModel() = Country(
        countryId = this.getKeyOrThrow(),
        userId = this.userId,
        color = this.color,
    )

}

