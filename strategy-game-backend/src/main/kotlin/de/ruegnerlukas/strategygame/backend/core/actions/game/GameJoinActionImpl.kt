package de.ruegnerlukas.strategygame.backend.core.actions.game

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.COUNTRY_COLORS
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryResources
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.GameJoinActionErrors
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction.UserAlreadyPlayerError
import de.ruegnerlukas.strategygame.backend.ports.provided.game.UncoverMapAreaAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameJoinActionImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val countryInsert: CountryInsert,
    private val tilesQuery: TilesQueryByGame,
    private val gameConfig: GameConfig,
    private val actionUncoverMapArea: UncoverMapAreaAction,
) : GameJoinAction, Logging {

    override suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit> {
        log().info("Joining game $gameId as user $userId)")
        return either {
            val game = findGame(gameId).bind()
            validate(game, userId).bind()
            insertPlayer(game, userId)
            val countryId = insertCountry(game, userId)
            uncoverStartingArea(countryId, gameId)
        }
    }


    /**
     * Find and return the game with the given id or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, GameEntity> {
        return gameQuery.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * Validate whether the given user can join the given game. Return nothing or an [UserAlreadyPlayerError]
     */
    private fun validate(game: GameEntity, userId: String): Either<UserAlreadyPlayerError, Unit> {
        val existsPlayer = game.players.map { it.userId }.contains(userId)
        if (existsPlayer) {
            return UserAlreadyPlayerError.left()
        } else {
            return Unit.right()
        }
    }


    /**
     * Add the user as a player to the given game
     */
    private suspend fun insertPlayer(game: GameEntity, userId: String) {
        game.players.add(
            PlayerEntity(
                userId = userId,
                connectionId = null,
                state = PlayerEntity.STATE_PLAYING,
            )
        )
        gameUpdate.execute(game)
    }


    /**
     * Add the country for the given user to the given game
     */
    private suspend fun insertCountry(game: GameEntity, userId: String): String {
        return countryInsert.execute(
            CountryEntity(
                gameId = game.getKeyOrThrow(),
                userId = userId,
                color = COUNTRY_COLORS[(game.players.size - 1) % COUNTRY_COLORS.size],
                resources = CountryResources(
                    money = gameConfig.startingAmountMoney,
                    wood = gameConfig.startingAmountWood,
                    food = gameConfig.startingAmountFood,
                    stone = gameConfig.startingAmountStone,
                    metal = gameConfig.startingAmountMetal
                )
            )
        ).getOrElse { throw Exception("Could not insert country of user $userId in game ${game.key}") }
    }


    /**
     * Pick a random starting location and uncover the surrounding tiles
     */
    private suspend fun uncoverStartingArea(countryId: String, gameId: String) {
        val startingTile = tilesQuery.execute(gameId).random()
        actionUncoverMapArea.perform(countryId, gameId, startingTile.position, gameConfig.startingAreaRadius)
    }

}