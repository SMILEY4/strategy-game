package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.getOrElse
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlayerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction.TurnSubmitActionError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertCommands
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryCountryByGameAndUser
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGame
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdateGame
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TurnSubmitActionImpl(
	private val actionEndTurn: TurnEndAction,
	private val queryGame: QueryGame,
	private val queryCountryByGameAndUser: QueryCountryByGameAndUser,
	private val updateGame: UpdateGame,
	private val insertCommands: InsertCommands,
) : TurnSubmitAction, Logging {

	override suspend fun perform(userId: String, gameId: String, commands: List<PlayerCommand>): Either<TurnSubmitActionError, Unit> {
		log().info("user $userId submits ${commands.size} commands for game $gameId")
		return either {
			val game = getGame(gameId)
			val country = getCountry(game, userId)
			updatePlayerState(game, userId)
			saveCommands(game, country, commands)
			maybeEndTurn(game)
		}
	}


	/**
	 * Fetch the game with the given id. Since we already found a player, we can assume the game exists
	 */
	private suspend fun getGame(gameId: String): GameEntity {
		return queryGame.execute(gameId)
			.getOrElse { throw Exception("Could not get game $gameId") }
	}


	/**
	 * Fetch the country for the given user and game
	 */
	private suspend fun getCountry(game: GameEntity, userId: String): CountryEntity {
		return queryCountryByGameAndUser.execute(game.id!!, userId)
			.getOrElse { throw Exception("Country for user $userId in game ${game.id} not found.") }
	}


	/**
	 * Set the state of the given player to "submitted"
	 */
	private suspend fun updatePlayerState(game: GameEntity, userId: String) {
		val player = game.players.find { it.userId == userId }
		if (player != null) {
			player.state = PlayerEntity.STATE_SUBMITTED
			updateGame.execute(game)
		}
	}


	/**
	 * save the given commands at the given game
	 */
	private suspend fun saveCommands(game: GameEntity, country: CountryEntity, commands: List<PlayerCommand>) {
		insertCommands.execute(createCommands(game, country, commands))
	}


	/**
	 * create the command-entities from the given [PlayerCommand]s
	 */
	private fun createCommands(game: GameEntity, country: CountryEntity, commands: List<PlayerCommand>): List<CommandEntity<*>> {
		return commands.map { command ->
			when (command) {
				is PlaceMarkerCommand -> createCommandPlaceMarker(game, country, command)
				is CreateCityCommand -> createCommandCreateCity(game, country, command)
			}
		}
	}


	/**
	 * create a command-entity from the given [PlaceMarkerCommand]
	 */
	private fun createCommandPlaceMarker(game: GameEntity, country: CountryEntity, cmd: PlaceMarkerCommand): CommandEntity<*> {
		return CommandEntity(
			turn = game.turn,
			countryId = country.id!!,
			data = PlaceMarkerCommandDataEntity(
				q = cmd.q,
				r = cmd.r
			)
		)
	}


	/**
	 * create a command-entity from the given [CreateCityCommand]
	 */
	private fun createCommandCreateCity(game: GameEntity, country: CountryEntity, cmd: CreateCityCommand): CommandEntity<*> {
		return CommandEntity(
			turn = game.turn,
			countryId = country.id!!,
			data = CreateCityCommandDataEntity(
				q = cmd.q,
				r = cmd.r
			)
		)
	}


	/**
	 * End turn if all players submitted their commands (none in state "playing")
	 */
	private suspend fun maybeEndTurn(game: GameEntity) {
		val countPlaying = game.players.count { it.state == PlayerEntity.STATE_PLAYING }
		if (countPlaying == 0) {
			val result = actionEndTurn.perform(game.id!!)
			if (result is Either.Left) {
				when (result.value) {
					TurnEndAction.GameNotFoundError -> throw Exception("Could not find game ${game.id} when ending turn")
					TurnEndAction.CommandResolutionFailedError -> throw Exception("Could not resolve turn for game ${game.id}")
				}
			}
		}
	}

}