package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.jsondsl.obj
import de.ruegnerlukas.strategygame.backend.common.utils.notContainedIn
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province

class ProvincePOVBuilder(
    private val povCache: POVCache,
    private val detailLogBuilder: DetailLogPOVBuilder,
    private val povCountryId: String,
) {

    fun build(province: Province): JsonType? {
        if (province.provinceId.notContainedIn(povCache.knownProvinces())) {
            return null
        }
        return obj {
            "id" to province.provinceId
            "country" to province.countryId
            "cities" to province.cityIds
                .filter { povCache.knownCities().contains(it) }
            "resources" to objHidden(province.countryId == povCountryId) {
                province.resourceLedger.getEntries().map { entry ->
                    obj {
                        "type" to entry.resourceType
                        "amount" to entry.produced - entry.consumed
                        "missing" to entry.missing
                        "details" to entry.getDetails().map { detail -> detailLogBuilder.build(detail) }
                    }
                }
            }
        }
    }

}