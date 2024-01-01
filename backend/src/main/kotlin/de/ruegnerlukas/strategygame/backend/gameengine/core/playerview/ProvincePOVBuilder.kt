package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ObjectType
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.utils.arrMap
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province

class ProvincePOVBuilder(
    private val dtoCache: POVCache,
    private val detailLogBuilder: DetailLogPOVBuilder,
    private val countryId: String,
    private val cities: List<City>
) {

    fun build(province: Province): ObjectType? {
        if (!shouldInclude(province)) {
            return null
        }
        return obj {
            "dataTier1" to obj {
                "id" to province.provinceId
                "name" to province.provinceId // todo
                "color" to obj {
                    "red" to province.color.red
                    "green" to province.color.green
                    "blue" to province.color.blue
                }
                "country" to dtoCache.countryIdentifier(province.countryId)
                "cities" to arrMap[province.cityIds.filter { shouldInclude(it) }, { cityId ->
                    dtoCache.cityReduced(cityId)
                }]
            }
            if (province.countryId == countryId) {
                "dataTier3" to obj {
                    "resources" to arrMap[province.resourceLedger.getEntries(), { entry ->
                        obj {
                            "type" to entry.resourceType
                            "amount" to entry.produced - entry.consumed
                            "missing" to entry.missing
                            "details" to arrMap[entry.getDetails(), { detail -> detailLogBuilder.build(detail) }]
                        }
                    }]
                }
            }
        }
    }

    private fun shouldInclude(province: Province): Boolean {
        return province.cityIds
            .map { cityId -> cities.find { it.cityId == cityId } }
            .any { city -> dtoCache.tileVisibility(city!!.tile.tileId).isAtLeast(VisibilityDTO.DISCOVERED) }
    }

    private fun shouldInclude(cityId: String): Boolean {
        return dtoCache.tileVisibility(cities.find { it.cityId == cityId }!!.tile.tileId).isAtLeast(VisibilityDTO.DISCOVERED)
    }

}