package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileContainer

class POVCache(
    private val game: GameExtended,
    private val gameConfig: GameConfig,
    private val countryId: String
) {

    companion object {

        const val UNKNOWN_COUNTRY_ID = "?"
        const val UNKNOWN_PROVINCE_ID = "?"
        const val UNKNOWN_CITY_ID = "?"

    }

    private val countryIdentifiers = mutableMapOf<String, ObjectType>()
    private val provinceIdentifiers = mutableMapOf<String, ObjectType>()
    private val cityIdentifiers = mutableMapOf<String, ObjectType>()

    private val provincesReduced = mutableMapOf<String, ObjectType>()
    private val citiesReduced = mutableMapOf<String, ObjectType>()

    private val tileVisibilities = mutableMapOf<String, VisibilityDTO>()

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
        countryIdentifiers[UNKNOWN_COUNTRY_ID] = obj {
            "id" to UNKNOWN_COUNTRY_ID
            "name" to UNKNOWN_COUNTRY_ID
            "color" to {
                "red" to 0
                "green" to 0
                "blue" to 0
            }
        }
        provinceIdentifiers[UNKNOWN_PROVINCE_ID] = obj {
            "id" to UNKNOWN_PROVINCE_ID
            "name" to UNKNOWN_PROVINCE_ID
            "color" to {
                "red" to 0
                "green" to 0
                "blue" to 0
            }
        }
        cityIdentifiers[UNKNOWN_CITY_ID] = obj {
            "id" to UNKNOWN_CITY_ID
            "name" to UNKNOWN_CITY_ID
            "color" to {
                "red" to 0
                "green" to 0
                "blue" to 0
            }
        }
        game.cities.forEach { city ->
            citiesReduced[city.cityId] = obj {
                "id" to city.cityId
                "name" to city.meta.name
                "color" to {
                    "red" to city.meta.color
                    "green" to city.meta.color.green
                    "blue" to city.meta.color.blue
                }
                "isCountryCapitol" to false
                "isProvinceCapitol" to city.meta.isProvinceCapital
            }
        }
        game.provinces.forEach { province ->
            provincesReduced[province.provinceId] = obj {
                "id" to province.provinceId
                "name" to province.provinceId // todo
                "color" to {
                    "red" to province.color
                    "green" to province.color.green
                    "blue" to province.color.blue
                }
                "cities" to arr[province.cityIds.map { citiesReduced[it] }]
            }
        }
        game.tiles.forEach { tile ->
            tileVisibilities[tile.tileId] = calculateVisibility(tile, game.tiles)
        }
    }

    private fun calculateVisibility(tile: Tile, tiles: TileContainer): VisibilityDTO {
        if (tile.discoveredByCountries.contains(countryId)) {
            val scoutNearby = positionsCircle(tile.position, gameConfig.scoutVisibilityRange)
                .asSequence()
                .mapNotNull { pos -> tiles.get(pos) }
                .mapNotNull { t -> t.objects.find { it is ScoutTileObject }?.let { it as ScoutTileObject } }
                .any { it.countryId == countryId }
            if (scoutNearby) {
                return VisibilityDTO.VISIBLE
            }
            val hasInfluence = tile.influences.any { it.countryId == countryId }
            val foreignOwner = tile.owner != null && tile.owner?.countryId != countryId
            return if (hasInfluence && !foreignOwner) {
                VisibilityDTO.VISIBLE
            } else {
                VisibilityDTO.DISCOVERED
            }
        } else {
            return VisibilityDTO.UNKNOWN
        }
    }

    fun countryIdentifier(countryId: String): ObjectType =
        countryIdentifiers[countryId] ?: throw Exception("No country identifier for $countryId")

    fun countryIdentifierOrNull(countryId: String?): ObjectType? =
        countryId?.let { countryIdentifiers[countryId] }

    fun provinceIdentifier(provinceId: String): ObjectType =
        provinceIdentifiers[provinceId] ?: throw Exception("No province identifier for $provinceId")

    fun provinceIdentifierOrNull(provinceId: String?): ObjectType? =
        provinceId?.let { provinceIdentifiers[provinceId] }

    fun cityIdentifier(cityId: String): ObjectType =
        cityIdentifiers[cityId] ?: throw Exception("No city identifier for $cityId")

    fun cityIdentifierOrNull(cityId: String?): ObjectType? =
        cityId?.let { cityIdentifiers[cityId] }

    fun cityReduced(cityId: String) =
        citiesReduced[cityId] ?: throw Exception("No reduced city for $cityId")

    fun provinceReduced(provinceId: String) =
        provincesReduced[provinceId] ?: throw Exception("No reduced province for $provinceId")

    fun tileVisibility(tileId: String): VisibilityDTO =
        tileVisibilities[tileId] ?: throw Exception("No visibility for $tileId")
}