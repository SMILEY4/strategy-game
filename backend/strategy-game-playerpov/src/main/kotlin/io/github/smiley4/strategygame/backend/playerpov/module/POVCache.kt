package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.RGBColor
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ScoutTileObject
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileContainer


internal class  POVCache(
    private val game: GameExtended,
    private val gameConfig: GameConfig,
    private val povCountryId: String
) {

    companion object {
        const val UNKNOWN_COUNTRY_ID = "?"
        const val UNKNOWN_PROVINCE_ID = "?"
        const val UNKNOWN_CITY_ID = "?"
    }

    private val knownCountries = mutableSetOf<String>()
    private val knownProvinces = mutableSetOf<String>()
    private val knownCities = mutableSetOf<String>()

    private val countryIdentifiers = mutableMapOf<String, JsonType>()
    private val provinceIdentifiers = mutableMapOf<String, JsonType>()
    private val cityIdentifiers = mutableMapOf<String, JsonType>()
    private val tileIdentifiers = mutableMapOf<String, JsonType>()

    private val provincesReduced = mutableMapOf<String, JsonType>()
    private val citiesReduced = mutableMapOf<String, JsonType>()

    private val tileVisibilities = mutableMapOf<String, TileVisibilityDTO>()

    init {
        game.tiles.forEach { tile ->
            val visibility = calculateVisibility(tile, game.tiles)
            tileVisibilities[tile.tileId] = visibility
            if (visibility !== TileVisibilityDTO.UNKNOWN) {
                tile.owner?.countryId?.also { knownCountries.add(it) }
                tile.owner?.provinceId?.also { knownProvinces.add(it) }
                tile.owner?.cityId?.also { knownCities.add(it) }
            }
        }
        knownCountries.add(povCountryId)

        game.countries.forEach { country ->
            countryIdentifiers[country.countryId] = obj {
                "id" to country.countryId
                "name" to country.countryId // todo: store proper name
                "color" to country.color
            }
        }
        game.provinces.forEach { province ->
            provinceIdentifiers[province.provinceId] = obj {
                "id" to province.provinceId
                "name" to province.provinceId // todo: store proper name
                "color" to province.color
            }
        }
        game.cities.forEach { city ->
            cityIdentifiers[city.cityId] = obj {
                "id" to city.cityId
                "name" to city.meta.name
                "color" to city.meta.color
            }
        }
        game.tiles.forEach { tile ->
            tileIdentifiers[tile.tileId] = obj {
                "id" to tile.tileId
                "q" to tile.position.q
                "r" to tile.position.r
            }
        }
        countryIdentifiers[UNKNOWN_COUNTRY_ID] = obj {
            "id" to UNKNOWN_COUNTRY_ID
            "name" to UNKNOWN_COUNTRY_ID
            "color" to RGBColor.BLACK
        }
        provinceIdentifiers[UNKNOWN_PROVINCE_ID] = obj {
            "id" to UNKNOWN_PROVINCE_ID
            "name" to UNKNOWN_PROVINCE_ID
            "color" to RGBColor.BLACK
        }
        cityIdentifiers[UNKNOWN_CITY_ID] = obj {
            "id" to UNKNOWN_CITY_ID
            "name" to UNKNOWN_CITY_ID
            "color" to RGBColor.BLACK
        }
        game.cities.forEach { city ->
            citiesReduced[city.cityId] = obj {
                "id" to city.cityId
                "isProvinceCapitol" to city.meta.isProvinceCapital
            }
        }
        game.provinces.forEach { province ->
            provincesReduced[province.provinceId] = obj {
                "id" to province.provinceId
                "cities" to province.cityIds.map { citiesReduced[it] }
            }
        }
    }

    private fun calculateVisibility(tile: Tile, tiles: TileContainer): TileVisibilityDTO {
        if (tile.discoveredByCountries.contains(povCountryId)) {
            val scoutNearby = positionsCircle(tile.position, gameConfig.scoutVisibilityRange)
                .asSequence()
                .mapNotNull { pos -> tiles.get(pos) }
                .mapNotNull { t -> t.objects.find { it is ScoutTileObject }?.let { it as ScoutTileObject } }
                .any { it.countryId == povCountryId }
            if (scoutNearby) {
                return TileVisibilityDTO.VISIBLE
            }
            val hasInfluence = tile.influences.any { it.countryId == povCountryId }
            val foreignOwner = tile.owner != null && tile.owner?.countryId != povCountryId
            return if (hasInfluence && !foreignOwner) {
                TileVisibilityDTO.VISIBLE
            } else {
                TileVisibilityDTO.DISCOVERED
            }
        } else {
            return TileVisibilityDTO.UNKNOWN
        }
    }

    fun knownCountries(): Set<String> = knownCountries

    fun knownProvinces(): Set<String> = knownProvinces

    fun knownCities(): Set<String> = knownCities

    fun countryIdentifier(countryId: String): JsonType =
        countryIdentifiers[countryId] ?: throw Exception("No country identifier for $countryId")

    fun countryIdentifierOrNull(countryId: String?): JsonType? =
        countryId?.let { countryIdentifiers[countryId] }

    fun provinceIdentifier(provinceId: String): JsonType =
        provinceIdentifiers[provinceId] ?: throw Exception("No province identifier for $provinceId")

    fun provinceIdentifierOrNull(provinceId: String?): JsonType? =
        provinceId?.let { provinceIdentifiers[provinceId] }

    fun cityIdentifier(cityId: String): JsonType =
        cityIdentifiers[cityId] ?: throw Exception("No city identifier for $cityId")

    fun cityIdentifierOrNull(cityId: String?): JsonType? =
        cityId?.let { cityIdentifiers[cityId] }


    fun tileIdentifier(tileId: String): JsonType =
        tileIdentifiers[tileId] ?: throw Exception("No tile identifier for $tileId")

    fun tileIdentifierOrNull(tileId: String?): JsonType? =
        tileId?.let { tileIdentifiers[tileId] }

    fun cityReduced(cityId: String) =
        citiesReduced[cityId] ?: throw Exception("No reduced city for $cityId")

    fun provinceReduced(provinceId: String) =
        provincesReduced[provinceId] ?: throw Exception("No reduced province for $provinceId")

    fun tileVisibility(tileId: String): TileVisibilityDTO =
        tileVisibilities[tileId] ?: throw Exception("No visibility for $tileId")
}