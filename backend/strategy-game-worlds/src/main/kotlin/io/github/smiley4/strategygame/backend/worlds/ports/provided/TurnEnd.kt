package io.github.smiley4.strategygame.backend.worlds.ports.provided

interface TurnEnd {

	sealed class TurnEndError : Exception()
	class GameNotFoundError : TurnEndError()


	/**
	 * Ends the current turn of the given game
	 * @throws TurnEndError
	 * @throws GameStepError
	 */
	suspend fun perform(gameId: String)

}