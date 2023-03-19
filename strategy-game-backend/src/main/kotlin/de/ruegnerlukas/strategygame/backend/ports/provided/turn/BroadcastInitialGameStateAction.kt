package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either

interface BroadcastInitialGameStateAction {

	sealed class WorldStateBroadcasterActionError
	object GameNotFoundError : WorldStateBroadcasterActionError()

	suspend fun perform(gameId: String, connectionIds: List<Int>): Either<WorldStateBroadcasterActionError, Unit>
}