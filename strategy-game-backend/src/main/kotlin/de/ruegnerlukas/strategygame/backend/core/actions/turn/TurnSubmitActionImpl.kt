package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.external.persistence.DbId
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommand
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.Player
import de.ruegnerlukas.strategygame.backend.ports.models.PlayerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.TurnSubmitActionError
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CommandsInsert
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.CountryByGameAndUserQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameQuery
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TurnSubmitActionImpl(
    private val actionEndTurn: TurnEndAction,
    private val gameQuery: GameQuery,
    private val countryByGameAndUserQuery: CountryByGameAndUserQuery,
    private val gameUpdate: GameUpdate,
    private val commandsInsert: CommandsInsert,
) : TurnSubmitAction, Logging {

    private val metricId = metricCoreAction(TurnSubmitAction::class)

    override suspend fun perform(userId: String, gameId: String, commands: List<PlayerCommand>): Either<TurnSubmitActionError, Unit> {
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
    private suspend fun saveCommands(game: Game, country: Country, commands: List<PlayerCommand>) {
        commandsInsert.execute(createCommands(game, country, commands))
    }

    /**
     * create the command-entities from the given [PlayerCommand]s
     */
    private fun createCommands(game: Game, country: Country, commands: List<PlayerCommand>): List<Command<*>> {
        return commands.map { command ->
            when (command) {
                is PlaceMarkerCommand -> createCommandPlaceMarker(game, country, command)
                is CreateCityCommand -> createCommandCreateCity(game, country, command)
                is CreateBuildingCommand -> createCommandCreateBuilding(game, country, command)
                is PlaceScoutCommand -> createCommandPlaceScout(game, country, command)
            }
        }
    }

    /**
     * create a command-entity from the given [PlaceMarkerCommand]
     */
    private fun createCommandPlaceMarker(game: Game, country: Country, cmd: PlaceMarkerCommand): Command<*> {
        return Command(
            commandId = DbId.PLACEHOLDER,
            turn = game.turn,
            countryId = country.countryId,
            data = PlaceMarkerCommandData(
                q = cmd.q,
                r = cmd.r
            )
        )
    }

    /**
     * create a command-entity from the given [CreateCityCommand]
     */
    private fun createCommandCreateCity(game: Game, country: Country, cmd: CreateCityCommand): Command<*> {
        return Command(
            commandId = DbId.PLACEHOLDER,
            turn = game.turn,
            countryId = country.countryId,
            data = CreateCityCommandData(
                q = cmd.q,
                r = cmd.r,
                name = cmd.name.trim(),
                withNewProvince = cmd.withNewProvince
            )
        )
    }

    /**
     * create a command-entity from the given [CreateBuildingCommand]
     */
    private fun createCommandCreateBuilding(game: Game, country: Country, cmd: CreateBuildingCommand): Command<*> {
        return Command(
            commandId = DbId.PLACEHOLDER,
            turn = game.turn,
            countryId = country.countryId,
            data = CreateBuildingCommandData(
                cityId = cmd.cityId,
                buildingType = cmd.buildingType
            )
        )
    }

    /**
     * create a command-entity from the given [PlaceScoutCommand]
     */
    private fun createCommandPlaceScout(game: Game, country: Country, cmd: PlaceScoutCommand): Command<*> {
        return Command(
            commandId = DbId.PLACEHOLDER,
            turn = game.turn,
            countryId = country.countryId,
            data = PlaceScoutCommandData(
                q = cmd.q,
                r = cmd.r
            )
        )
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