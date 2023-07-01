package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country

class CountryEntity(
    val gameId: String,
    val userId: String,
    val color: ColorEntity,
    val availableSettlers: Int,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Country, gameId: String) = CountryEntity(
            key = DbId.asDbId(serviceModel.countryId),
            gameId = gameId,
            userId = serviceModel.userId,
            color = ColorEntity.of(serviceModel.color),
            availableSettlers = serviceModel.availableSettlers
        )
    }

    fun asServiceModel() = Country(
        countryId = this.getKeyOrThrow(),
        userId = this.userId,
        color = this.color.toRGBColor(),
        availableSettlers = this.availableSettlers
    )

}

