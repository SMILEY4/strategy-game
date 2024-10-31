package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.commondata.Game

interface TurnEnd {

	sealed class TurnEndError(message: String, cause: Throwable? = null) : Exception(message, cause)
	class GameNotFoundError(cause: Throwable? = null) : TurnEndError("No game with the given id could be found", cause)
	class GameStepError(cause: Throwable? = null) : TurnEndError("The game step could not be performed", cause)


	/**
	 * Ends the current turn of the given game
	 * @throws TurnEndError
	 */
	suspend fun perform(gameId: Game.Id)

}