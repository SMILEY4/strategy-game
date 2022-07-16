package de.ruegnerlukas.strategygame.backend.ports.provided.game

import arrow.core.Either

interface GameConnectAction {

	sealed class GameConnectActionError
	object NotParticipantError: GameConnectActionError()

	suspend fun perform(userId: String, gameId: String, connectionId: Int): Either<GameConnectActionError, Unit>

}