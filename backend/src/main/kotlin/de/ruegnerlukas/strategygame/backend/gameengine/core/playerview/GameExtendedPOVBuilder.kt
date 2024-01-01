package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.arr
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.utils.JsonDocument
import de.ruegnerlukas.strategygame.backend.common.utils.buildJson
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended


class GameExtendedPOVBuilder(private val gameConfig: GameConfig) {

    private val metricId = MetricId.action(GameExtendedPOVBuilder::class)

    fun create(userId: String, game: GameExtended): JsonDocument {
        return time(metricId) {

            val playerCountry = game.findCountryByUser(userId)

            val dtoCache = POVCache(game, gameConfig, playerCountry.countryId)
            val detailLogBuilder = DetailLogPOVBuilder()

            val knownCountryIds = KnownCountriesCalculator(dtoCache, playerCountry.countryId).getKnownCountries(game.tiles)

            val tileBuilder = TilePOVBuilder(dtoCache, playerCountry.countryId, knownCountryIds)
            val countryBuilder = CountryPOVBuilder(dtoCache, playerCountry.countryId, knownCountryIds, game.provinces)
            val cityBuilder = CityPOVBuilder(dtoCache, detailLogBuilder, playerCountry.countryId, game.provinces)
            val provinceBuilder = ProvincePOVBuilder(dtoCache, detailLogBuilder, playerCountry.countryId, game.cities)
            val routeBuilder = RoutePOVBuilder(dtoCache, game.cities)

            buildJson(true) {
                obj {
                    "turn" to game.meta.turn
                    "tiles" to arr[game.tiles.map { tileBuilder.build(it) }]
                    "countries" to arr[game.countries.mapNotNull { countryBuilder.build(it) }]
                    "cities" to arr[game.cities.mapNotNull { cityBuilder.build(it) }]
                    "provinces" to arr[game.provinces.mapNotNull { provinceBuilder.build(it) }]
                    "routes" to arr[game.routes.mapNotNull { routeBuilder.build(it) }]
                }
            }
        }
    }

}
