package io.github.smiley4.strategygame.backend.playerpov.application.builders

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.User


internal class  RealmPOVBuilder {

    fun build(realm: Realm, userId: User.Id): JsonType {
        return obj {
            "id" to realm.id.value
            "player" to obj {
                "userId" to realm.user.value
                "name" to realm.user.value // todo -> username
            }
            "ownedByUser" to (realm.user == userId)
        }
    }

}