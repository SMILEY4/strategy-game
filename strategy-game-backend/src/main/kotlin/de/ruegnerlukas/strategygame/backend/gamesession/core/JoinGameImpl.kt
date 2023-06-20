package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.common.utils.COUNTRY_COLORS
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.Player
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame.GameJoinActionErrors
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame.UserAlreadyPlayerError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CountryInsert
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.TilesQueryByGame

class JoinGameImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val countryInsert: CountryInsert,
    private val tilesQuery: TilesQueryByGame,
    private val gameConfig: GameConfig,
    private val actionUncoverMapArea: UncoverMapAreaAction,
) : JoinGame, Logging {

    private val metricId = metricCoreAction(JoinGame::class)

    override suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("Joining game $gameId as user $userId)")
            either {
                val game = findGame(gameId).bind()
                validate(game, userId).bind()
                createPlayer(game, userId)
                val countryId = createCountry(game, userId)
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
        return if (game.players.existsByUserId(userId)) {
            UserAlreadyPlayerError.err()
        } else {
            Unit.ok()
        }
    }

    /**
     * Add the user as a player to the given game
     */
    private suspend fun createPlayer(game: Game, userId: String) {
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
    private suspend fun createCountry(game: Game, userId: String): String {
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