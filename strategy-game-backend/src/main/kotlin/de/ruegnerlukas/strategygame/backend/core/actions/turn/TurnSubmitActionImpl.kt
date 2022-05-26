package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.ConnectionState
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.Game
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlayerState
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.Either
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.Ok
import de.ruegnerlukas.strategygame.backend.shared.flatMap
import de.ruegnerlukas.strategygame.backend.shared.map
import de.ruegnerlukas.strategygame.backend.shared.mapError

class TurnSubmitActionImpl(
	private val repository: GameRepository,
	private val endTurnAction: TurnEndAction
) : TurnSubmitAction, Logging {

	override suspend fun perform(userId: String, gameId: String, commands: List<PlaceMarkerCommand>): Either<Unit, ApplicationError> {
		log().info("user $userId submits ${commands.size} commands for game $gameId")
		return repository.get(gameId)
			.map { updateState(it, userId, commands) }
			.mapError(EntityNotFoundError) { GameNotFoundError }
			.flatMap { repository.save(it) }
			.flatMap { maybeEndTurn(it) }
	}

	private fun updateState(prev: Game, userId: String, commands: List<PlaceMarkerCommand>): Game {
		return prev.copy(
			participants = prev.participants.map {
				if (it.userId == userId) {
					it.copy(state = PlayerState.SUBMITTED)
				} else {
					it
				}
			},
			commands = prev.commands + commands.map { PlaceMarkerCommand(userId, it.q, it.r) }
		)
	}

	private suspend fun maybeEndTurn(state: Game): Either<Unit, ApplicationError> {
		val allSubmitted = state.participants
			.filter { it.connection.state == ConnectionState.CONNECTED }
			.all { it.state == PlayerState.SUBMITTED }
		if (allSubmitted) {
			return endTurnAction.perform(state.gameId)
		} else {
			return Ok(Unit)
		}
	}

}