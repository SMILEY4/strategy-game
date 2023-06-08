package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import arrow.core.Either

interface GameConnectAction {

	sealed class GameConnectActionError
	object GameNotFoundError : GameConnectActionError()
	object InvalidPlayerState : GameConnectActionError()

	suspend fun perform(userId: String, gameId: String, connectionId: Long): Either<GameConnectActionError, Unit>

}