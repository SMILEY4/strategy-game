package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.DiscoverMapArea
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializePlayer
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializePlayer.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CountryInsert
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameExistsQuery
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesQueryByGame

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
            throw GameNotFoundError()
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