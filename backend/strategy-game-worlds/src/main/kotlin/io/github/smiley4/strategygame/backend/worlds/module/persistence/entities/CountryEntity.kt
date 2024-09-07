package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.User


internal class CountryEntity(
    val gameId: String,
    val userId: String,
    val color: ColorEntity,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Country, gameId: String) = CountryEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            userId = serviceModel.user.value,
            color = ColorEntity.of(serviceModel.color),
        )
    }

    fun asServiceModel() = Country(
        id = Country.Id(this.getKeyOrThrow()),
        user = User.Id(this.userId),
        color = this.color.toRGBColor(),
    )

}

