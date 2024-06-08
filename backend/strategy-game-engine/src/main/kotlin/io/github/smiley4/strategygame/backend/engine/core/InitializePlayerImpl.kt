package io.github.smiley4.strategygame.backend.engine.core

import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.DbId
import io.github.smiley4.strategygame.backend.common.utils.RGBColor
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.provided.DiscoverMapArea
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer
import io.github.smiley4.strategygame.backend.engine.ports.required.CountryInsert
import io.github.smiley4.strategygame.backend.engine.ports.required.GameExistsQuery
import io.github.smiley4.strategygame.backend.engine.ports.required.TilesQueryByGame


class InitializePlayerImpl(
    private val gameConfig: GameConfig,
    private val countryInsert: CountryInsert,
    private val tilesQuery: TilesQueryByGame,
    private val discoverMapArea: DiscoverMapArea,
    private val gameExistsQuery: GameExistsQuery
) : InitializePlayer {

    private val metricId = MetricId.action(InitializePlayer::class)


    override suspend fun perform(gameId: String, userId: String, color: RGBColor) {
        return time(metricId) {
            validateGame(gameId)
            val countryId = createCountry(gameId, userId, color)
            uncoverStartingArea(countryId, gameId)
        }
    }


    /**
     * Check if the game with the given id exists
     */
    private suspend fun validateGame(gameId: String) {
        if (!gameExistsQuery.perform(gameId)) {
            throw InitializePlayer.GameNotFoundError()
        }
    }


    /**
     * Add the country for the given user to the given game
     */
    private suspend fun createCountry(gameId: String, userId: String, color: RGBColor): String {
        return countryInsert.execute(
            Country(
                countryId = DbId.PLACEHOLDER,
                userId = userId,
                color = color,
                availableSettlers = 3
            ),
            gameId
        )
    }


    /**
     * Pick a random starting location and uncover the surrounding tiles
     */
    private suspend fun uncoverStartingArea(countryId: String, gameId: String) {
        val startingTile = tilesQuery.execute(gameId).random()
        discoverMapArea.perform(countryId, gameId, startingTile.position, gameConfig.startingAreaRadius)
    }

}