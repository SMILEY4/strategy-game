package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.GameExtendedDTO


class GameExtendedDTOCreator(private val gameConfig: GameConfig) {

    private val metricId = MetricId.action(GameExtendedDTOCreator::class)

    fun create(userId: String, game: GameExtended): GameExtendedDTO {
        return time(metricId) {

            val playerCountry = game.findCountryByUser(userId)

            val knownCountryIds = KnownCountriesCalculator(gameConfig, playerCountry.countryId).getKnownCountries(game.tiles)

            val tileDTOs = TileDTOCreator(gameConfig, playerCountry.countryId).let { creator ->
                game.tiles.map { creator.build(it, knownCountryIds, game.tiles) }
            }

            val countryDTOs = CountryDTOCreator(playerCountry.countryId).let { creator ->
                knownCountryIds
                    .map { game.findCountry(it) }
                    .map { creator.build(it) }
            }

            val cityDTOs = CityDTOCreator().let { creator ->
                game.cities
                    .filter { creator.shouldInclude(it, tileDTOs) }
                    .map { creator.build(it) }
            }

            val provinceDTOs = ProvinceDTOCreator(playerCountry.countryId).let { creator ->
                game.provinces
                    .filter { creator.shouldInclude(it, cityDTOs) }
                    .map { creator.build(it) }
            }

            val routeDTOs = RouteDTOCreator().let { creator ->
                game.routes
                    .filter { creator.shouldInclude(it, cityDTOs) }
                    .map { creator.build(it) }
            }

            GameExtendedDTO(
                turn = game.meta.turn,
                tiles = tileDTOs,
                countries = countryDTOs,
                cities = cityDTOs,
                provinces = provinceDTOs,
                routes = routeDTOs
            )
        }
    }

}