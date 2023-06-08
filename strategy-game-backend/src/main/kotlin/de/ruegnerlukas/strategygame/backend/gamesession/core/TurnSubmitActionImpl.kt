package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandData
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.models.Player
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.persistence.DbId
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnEndAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnSubmitAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.TurnSubmitAction.TurnSubmitActionError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CommandsInsert
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.CountryByGameAndUserQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate

class TurnSubmitActionImpl(
    private val actionEndTurn: TurnEndAction,
    private val gameQuery: GameQuery,
    private val countryByGameAndUserQuery: CountryByGameAndUserQuery,
    private val gameUpdate: GameUpdate,
    private val commandsInsert: CommandsInsert,
) : TurnSubmitAction, Logging {

    private val metricId = metricCoreAction(TurnSubmitAction::class)

    override suspend fun perform(userId: String, gameId: String, commands: List<CommandData>): Either<TurnSubmitActionError, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("user $userId submits ${commands.size} commands for game $gameId")
            either {
                val game = getGame(gameId)
                val country = getCountry(game, userId)
                updatePlayerState(game, userId).bind()
                saveCommands(game, country, commands)
                maybeEndTurn(game)
            }
        }
    }


    /**
     * Fetch the game with the given id. Since we already found a player, we can assume the game exists
     */
    private suspend fun getGame(gameId: String): Game {
        return gameQuery.execute(gameId)
            .getOrElse { throw Exception("Could not get game $gameId") }
    }


    /**
     * Fetch the country for the given user and game
     */
    private suspend fun getCountry(game: Game, userId: String): Country {
        return countryByGameAndUserQuery.execute(game.gameId, userId)
            .getOrElse { throw Exception("Country for user $userId in game ${game.gameId} not found.") }
    }


    /**
     * Set the state of the given player to "submitted"
     */
    private suspend fun updatePlayerState(game: Game, userId: String): Either<TurnSubmitActionError, Unit> {
        val player = game.players.findByUserId(userId)
        if (player != null) {
            player.state = Player.STATE_SUBMITTED
            gameUpdate.execute(game)
            return Unit.right()
        } else {
            return NotParticipantError.left()
        }
    }


    /**
     * save the given commands at the given game
     */
    private suspend fun saveCommands(game: Game, country: Country, commands: List<CommandData>) {
        commandsInsert.execute(createCommands(game, country, commands))
    }


    /**
     * Create commands from the given command-data
     */
    private fun createCommands(game: Game, country: Country, commands: List<CommandData>): List<Command<*>> {
        return commands.map { data ->
            Command(
                commandId = DbId.PLACEHOLDER,
                turn = game.turn,
                countryId = country.countryId,
                data = data
            )
        }
    }


    /**
     * End turn if all players submitted their commands (none in state "playing")
     */
    private suspend fun maybeEndTurn(game: Game) {
        val countPlaying = game.players.count { it.state == Player.STATE_PLAYING && it.connectionId != null }
        if (countPlaying == 0) {
            val result = actionEndTurn.perform(game.gameId)
            if (result is Either.Left) {
                when (result.value) {
                    TurnEndAction.GameNotFoundError -> throw Exception("Could not find game ${game.gameId} when ending turn")
                    TurnEndAction.CommandResolutionFailedError -> throw Exception("Could not resolve turn for game ${game.gameId}")
                }
            }
        }
    }

}