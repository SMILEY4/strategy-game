package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.User


internal class  CountryPOVBuilder {

    fun build(country: Country, userId: User.Id): JsonType {
        return obj {
            "id" to country.id.value
            "name" to country.id.value // todo -> name
            "color" to obj {
                "red" to country.color.red
                "green" to country.color.green
                "blue" to country.color.blue
            }
            "player" to obj {
                "userId" to country.user.value
                "name" to country.user.value // todo -> name
            }
            "ownedByUser" to (country.user == userId)
        }
    }

}