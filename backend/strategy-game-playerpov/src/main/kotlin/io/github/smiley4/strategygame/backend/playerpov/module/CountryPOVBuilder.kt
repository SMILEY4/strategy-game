package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Country


internal class  CountryPOVBuilder {

    fun build(country: Country, userId: String): JsonType {
        return obj {
            "id" to country.countryId
            "name" to country.countryId
            "color" to obj {
                "red" to country.color.red
                "green" to country.color.green
                "blue" to country.color.blue
            }
            "player" to obj {
                "userId" to country.userId
                "name" to country.userId // todo
            }
            "ownedByUser" to (country.userId == userId)
        }
    }

}