package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError

interface BroadcastTurnResultAction {

	sealed class WorldStateBroadcasterActionError
	object GameNotFoundError : WorldStateBroadcasterActionError()

	suspend fun perform(gameId: String, errors: List<CommandResolutionError>): Either<WorldStateBroadcasterActionError, Unit>
}