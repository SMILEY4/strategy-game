package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.common.utils.notContainedIn
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended


class CountryPOVBuilder(
    private val povCache: POVCache,
    private val povCountryId: String,
    private val game: GameExtended
) {

    fun build(country: Country): JsonType? {
        if (country.countryId.notContainedIn(povCache.knownCountries())) {
            return null
        }
        return obj {
            "id" to country.countryId
            "isPlayerOwned" to (country.countryId == povCountryId)
            "player" to obj {
                "userId" to country.userId
                "name" to country.userId // todo
            }
            "provinces" to game.provinces
                .filter { it.countryId == country.countryId }
                .filter { povCache.knownProvinces().contains(it.provinceId) }
                .map { povCache.provinceReduced(it.provinceId) }
            "availableSettlers" to objHidden(country.countryId == povCountryId) {
                country.availableSettlers
            }
        }
    }

}