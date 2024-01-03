package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.jsondsl.obj
import de.ruegnerlukas.strategygame.backend.common.utils.notContainedIn
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

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