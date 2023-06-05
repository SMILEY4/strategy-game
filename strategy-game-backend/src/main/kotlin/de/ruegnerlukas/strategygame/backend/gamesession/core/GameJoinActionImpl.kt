package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.common.GameConfig
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.COUNTRY_COLORS
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameJoinAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameJoinAction.GameJoinActionErrors
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameJoinAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameJoinAction.UserAlreadyPlayerError
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.game.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.CountryInsert
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.Player

class GameJoinActionImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val countryInsert: CountryInsert,
    private val tilesQuery: TilesQueryByGame,
    private val gameConfig: GameConfig,
    private val actionUncoverMapArea: UncoverMapAreaAction,
) : GameJoinAction, Logging {

    private val metricId = metricCoreAction(GameJoinAction::class)

    override suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("Joining game $gameId as user $userId)")
            either {
                val game = findGame(gameId).bind()
                validate(game, userId).bind()
                insertPlayer(game, userId)
                val countryId = insertCountry(game, userId)
                uncoverStartingArea(countryId, gameId)
            }
        }
    }

    /**
     * Find and return the game with the given id or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, Game> {
        return gameQuery.execute(gameId).mapLeft { GameNotFoundError }
    }

    /**
     * Validate whether the given user can join the given game. Return nothing or an [UserAlreadyPlayerError]
     */
    private fun validate(game: Game, userId: String): Either<UserAlreadyPlayerError, Unit> {
        if (game.players.existsByUserId(userId)) {
            return UserAlreadyPlayerError.left()
        } else {
            return Unit.right()
        }
    }

    /**
     * Add the user as a player to the given game
     */
    private suspend fun insertPlayer(game: Game, userId: String) {
        game.players.add(
            Player(
                userId = userId,
                connectionId = null,
                state = Player.STATE_PLAYING,
            )
        )
        gameUpdate.execute(game)
    }

    /**
     * Add the country for the given user to the given game
     */
    private suspend fun insertCountry(game: Game, userId: String): String {
        return countryInsert.execute(
            Country(
                countryId = DbId.PLACEHOLDER,
                userId = userId,
                color = COUNTRY_COLORS[(game.players.size - 1) % COUNTRY_COLORS.size],
                availableSettlers = 1
            ),
            game.gameId
        ).getOrElse { throw Exception("Could not insert country of user $userId in game ${game.gameId}") }
    }

    /**
     * Pick a random starting location and uncover the surrounding tiles
     */
    private suspend fun uncoverStartingArea(countryId: String, gameId: String) {
        val startingTile = tilesQuery.execute(gameId).random()
        actionUncoverMapArea.perform(countryId, gameId, startingTile.position, gameConfig.startingAreaRadius)
    }

}