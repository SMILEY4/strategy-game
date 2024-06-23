package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended


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
            val cityBuilder = CityPOVBuilder(povCache, detailLogBuilder, playerCountry.countryId, game.provinces, game.routes)
            val routeBuilder = RoutePOVBuilder(povCache)

            obj {
                "meta" to obj {
                    "turn" to game.meta.turn
                }
                "identifiers" to obj {
                    "countries" to obj {
                        povCache.knownCountries().forEach { id ->
                            id to povCache.countryIdentifier(id)
                        }
                    }
                    "provinces" to obj {
                        povCache.knownProvinces().forEach { id ->
                            id to povCache.provinceIdentifier(id)
                        }
                    }
                    "cities" to obj {
                        povCache.knownCities().forEach { id ->
                            id to povCache.cityIdentifier(id)
                        }
                    }
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
