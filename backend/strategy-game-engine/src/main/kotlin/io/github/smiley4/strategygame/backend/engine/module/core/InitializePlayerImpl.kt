package io.github.smiley4.strategygame.backend.engine.module.core

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.common.utils.RGBColor
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.engine.edge.InitializePlayer


internal class InitializePlayerImpl(
    private val gameConfig: GameConfig,
    private val discoverMapArea: DiscoverMapArea,
) : InitializePlayer {

    private val metricId = MetricId.action(InitializePlayer::class)


    override suspend fun perform(game: GameExtended, userId: String, color: RGBColor) {
        return time(metricId) {
            val country = addCountry(game, userId, color)
            uncoverStartingArea(country, game)
        }
    }


    /**
     * Add the country for the given user to the given game
     * @return the added country
     */
    private fun addCountry(game: GameExtended, userId: String, color: RGBColor): Country {
        val country = Country(
            countryId = Id.gen(),
            userId = userId,
            color = color,
            availableSettlers = 3
        )
        game.countries.add(country)
        return country
    }


    /**
     * Pick a random starting location and uncover the surrounding tiles.
     */
    private fun uncoverStartingArea(country: Country, game: GameExtended) {
        val startingTile = game.tiles.random()
        discoverMapArea.perform(country, game, startingTile.position, gameConfig.startingAreaRadius)
    }

}