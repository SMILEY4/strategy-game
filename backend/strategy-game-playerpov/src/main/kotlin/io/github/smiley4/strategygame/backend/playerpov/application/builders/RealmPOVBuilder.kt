package io.github.smiley4.strategygame.backend.playerpov.application.builders

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.User


internal class  RealmPOVBuilder {

    fun build(realm: Realm, userId: User.Id): JsonType {
        return obj {
            "id" to realm.id.value
            "name" to "todo" // todo
            "color" to obj { // todo
                "red" to 255
                "green" to 70
                "blue" to 90
            }
            "player" to obj {
                "userId" to realm.user.value
                "name" to realm.user.value
            }
            "ownedByUser" to (realm.user == userId)
        }
    }

}