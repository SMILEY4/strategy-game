package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Country


internal class  CountryPOVBuilder {

    fun build(country: Country): JsonType {
        return obj {
            "id" to country.countryId
            "name" to country.countryId
            "player" to obj {
                "userId" to country.userId
                "name" to country.userId // todo
            }
        }
    }

}