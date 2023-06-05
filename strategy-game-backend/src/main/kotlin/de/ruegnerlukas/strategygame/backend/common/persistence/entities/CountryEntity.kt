package de.ruegnerlukas.strategygame.backend.common.persistence.entities

import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.common.RGBColor

class CountryEntity(
    val gameId: String,
    val userId: String,
    val color: RGBColor,
    val availableSettlers: Int,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Country, gameId: String) = CountryEntity(
            key = DbId.asDbId(serviceModel.countryId),
            gameId = gameId,
            userId = serviceModel.userId,
            color = serviceModel.color,
            availableSettlers = serviceModel.availableSettlers
        )
    }

    fun asServiceModel() = Country(
        countryId = this.getKeyOrThrow(),
        userId = this.userId,
        color = this.color,
        availableSettlers = this.availableSettlers
    )

}

