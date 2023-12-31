package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ObjectType
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended

class DtoUtils(private val game: GameExtended) {

    private val countryIdentifiers = mutableMapOf<String, ObjectType>()
    private val provinceIdentifiers = mutableMapOf<String, ObjectType>()
    private val cityIdentifiers = mutableMapOf<String, ObjectType>()

    init {
        game.countries.forEach { country ->
            countryIdentifiers[country.countryId] = obj {
                "id" to country.countryId
                "name" to country.countryId // todo: store proper name
                "color" to {
                    "red" to country.color.red
                    "green" to country.color.green
                    "blue" to country.color.blue
                }
            }
        }
        game.provinces.forEach { province ->
            provinceIdentifiers[province.provinceId] = obj {
                "id" to province.provinceId
                "name" to province.provinceId // todo: store proper name
                "color" to {
                    "red" to province.color.red
                    "green" to province.color.green
                    "blue" to province.color.blue
                }
            }
        }
        game.cities.forEach { city ->
            cityIdentifiers[city.cityId] = obj {
                "id" to city.cityId
                "name" to city.meta.name
                "color" to {
                    "red" to city.meta.color
                    "green" to city.meta.color.green
                    "blue" to city.meta.color.blue
                }
            }
        }
    }


    fun countryIdentifier(countryId: String): ObjectType =
        countryIdentifiers[countryId] ?: throw Exception("No country identifier for $countryId")

    fun provinceIdentifier(provinceId: String): ObjectType =
        provinceIdentifiers[provinceId] ?: throw Exception("No province identifier for $provinceId")

    fun cityIdentifier(cityId: String): ObjectType =
        cityIdentifiers[cityId] ?: throw Exception("No city identifier for $cityId")

}