package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.CountryResources
import de.ruegnerlukas.strategygame.backend.shared.RGBColor

class CountryEntity(
    val gameId: String,
    val userId: String,
    val color: RGBColor,
    val resources: CountryResources,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Country) = CountryEntity(
            key = DbId.asDbId(serviceModel.countryId),
            gameId = serviceModel.gameId,
            userId = serviceModel.userId,
            color = serviceModel.color,
            resources = serviceModel.resources,
        )
    }

    fun asServiceModel() = Country(
        countryId = this.getKeyOrThrow(),
        gameId = this.gameId,
        userId = this.userId,
        color = this.color,
        resources = this.resources,
    )

}

