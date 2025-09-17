package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.utils.DbId
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.commondata.utils.RgbByteColor

internal class RealmEntity(
    val gameId: String,
    val userId: String,
    val name: String,
    val color: RgbByteColor,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Realm, gameId: String) = RealmEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            userId = serviceModel.user.value,
            name = serviceModel.name,
            color = serviceModel.color.toRgbByte()
        )
    }

    fun asServiceModel() = Realm(
        id = Realm.Id(this.getKeyOrThrow()),
        user = User.Id(this.userId),
        name = this.name,
        color = this.color
    )

}