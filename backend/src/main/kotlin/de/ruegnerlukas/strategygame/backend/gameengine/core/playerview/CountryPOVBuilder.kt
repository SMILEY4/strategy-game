package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province

class CountryPOVBuilder(
    private val dtoCache: POVCache,
    private val countryId: String,
    private val knownCountries: Set<String>,
    private val provinces: List<Province>
) {

    fun build(country: Country): ObjectType? {
        if (!knownCountries.contains(countryId)) {
            return null
        }
        val countryProvinces = provinces.filter { it.countryId == country.countryId }
        return obj {
            "dataTier1" to obj {
                "id" to country.countryId
                "name" to country.countryId // todo: store proper name
                "color" to obj {
                    "red" to country.color.red
                    "green" to country.color.green
                    "blue" to country.color.blue
                }
                "player" to obj {
                    "userId" to country.userId
                    "name" to "todo"
                }
                "provinces" to arr[countryProvinces.map { dtoCache.provinceReduced(it.provinceId) }]
            }
            if (country.countryId == countryId) {
                "dataTier3" to obj {
                    "availableSettlers" to country.availableSettlers
                }
            }
        }

    }

}