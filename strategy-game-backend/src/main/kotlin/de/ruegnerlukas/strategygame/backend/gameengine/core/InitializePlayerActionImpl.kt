package de.ruegnerlukas.strategygame.backend.gameengine.core

import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializePlayerAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CountryInsert
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.TilesQueryByGame

class InitializePlayerActionImpl(
    private val gameConfig: GameConfig,
    private val countryInsert: CountryInsert,
    private val tilesQuery: TilesQueryByGame,
    private val actionUncoverMapArea: UncoverMapAreaAction,
) : InitializePlayerAction {

    override suspend fun perform(gameId: String, userId: String, color: RGBColor) {
        val countryId = createCountry(gameId, userId, color)
        uncoverStartingArea(countryId, gameId)
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
                availableSettlers = 1
            ),
            gameId
        ).getOrElse { throw Exception("Could not insert country of user $userId in game $gameId") }
    }


    /**
     * Pick a random starting location and uncover the surrounding tiles
     */
    private suspend fun uncoverStartingArea(countryId: String, gameId: String) {
        val startingTile = tilesQuery.execute(gameId).random()
        actionUncoverMapArea.perform(countryId, gameId, startingTile.position, gameConfig.startingAreaRadius)
    }

}