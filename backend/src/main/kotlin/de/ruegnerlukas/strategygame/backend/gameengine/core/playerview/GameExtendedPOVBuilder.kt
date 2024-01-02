package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.jsondsl.obj
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended


class GameExtendedPOVBuilder(private val gameConfig: GameConfig) {

    private val metricId = MetricId.action(GameExtendedPOVBuilder::class)

    fun create(userId: String, game: GameExtended): JsonType {
        return time(metricId) {

            val playerCountry = game.findCountryByUser(userId)

            val povCache = POVCache(game, gameConfig, playerCountry.countryId)
            val detailLogBuilder = DetailLogPOVBuilder()

            val tileBuilder = TilePOVBuilder(povCache, playerCountry.countryId)
            val countryBuilder = CountryPOVBuilder(povCache, playerCountry.countryId, game)
            val provinceBuilder = ProvincePOVBuilder(povCache, detailLogBuilder, playerCountry.countryId)
            val cityBuilder = CityPOVBuilder(povCache, detailLogBuilder, playerCountry.countryId, game.provinces)
            val routeBuilder = RoutePOVBuilder(povCache)

            obj {
                "meta" to obj {
                    "turn" to game.meta.turn
                }
                "identifiers" to obj {
                    "countries" to povCache.knownCountries().map { povCache.countryIdentifier(it) }
                    "provinces" to povCache.knownProvinces().map { povCache.provinceIdentifier(it) }
                    "cities" to povCache.knownCities().map { povCache.cityIdentifier(it) }
                }
                "tiles" to game.tiles.mapNotNull { tileBuilder.build(it) }
                "countries" to game.countries.mapNotNull { countryBuilder.build(it) }
                "provinces" to game.provinces.mapNotNull { provinceBuilder.build(it) }
                "cities" to game.cities.mapNotNull { cityBuilder.build(it) }
                "routes" to game.routes.mapNotNull { routeBuilder.build(it) }
            }
        }
    }

}
