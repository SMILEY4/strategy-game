package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.commondata.CommandData


interface TurnSubmit {

    sealed class TurnSubmitActionError(message: String, cause: Throwable? = null) : Exception(message, cause)
    class NotParticipantError(cause: Throwable? = null) : TurnSubmitActionError("The given user is not a player in the game", cause)
    class GameNotFoundError(cause: Throwable? = null) : TurnSubmitActionError("No game with the given id could be found", cause)
    class EndTurnError(cause: Throwable? = null) : TurnSubmitActionError("Failed to properly end the turn", cause)

    /**
     * Submits the given commands of the given player for the given game
     * @throws TurnSubmitActionError
     */
    suspend fun perform(userId: String, gameId: String, commands: Collection<CommandData>)

}