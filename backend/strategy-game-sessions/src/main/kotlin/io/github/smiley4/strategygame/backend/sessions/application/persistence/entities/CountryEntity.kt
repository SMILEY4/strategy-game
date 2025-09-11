package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.User


internal class CountryEntity(
    val gameId: String,
    val userId: String,
    val color: ColorEntity,
    val name: String,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Country, gameId: String) = CountryEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            userId = serviceModel.user.value,
            color = ColorEntity.of(serviceModel.color),
            name = serviceModel.name,
        )
    }

    fun asServiceModel() = Country(
        id = Country.Id(this.getKeyOrThrow()),
        user = User.Id(this.userId),
        color = this.color.toRGBColor(),
        name = this.name,
    )

}

