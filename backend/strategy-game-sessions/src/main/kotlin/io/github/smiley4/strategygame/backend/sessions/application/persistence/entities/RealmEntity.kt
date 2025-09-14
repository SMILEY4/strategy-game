package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commonarangodb.DbEntity
import io.github.smiley4.strategygame.backend.commondata.DbId
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.User

internal class RealmEntity(
    val gameId: String,
    val userId: String,
    key: String? = null
) : DbEntity(key) {

    companion object {
        fun of(serviceModel: Realm, gameId: String) = RealmEntity(
            key = DbId.asDbId(serviceModel.id.value),
            gameId = gameId,
            userId = serviceModel.user.value,
        )
    }

    fun asServiceModel() = Realm(
        id = Realm.Id(this.getKeyOrThrow()),
        user = User.Id(this.userId),
    )

}