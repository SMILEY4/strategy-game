package io.github.smiley4.strategygame.backend.worlds.edge

import io.github.smiley4.strategygame.backend.commondata.CommandData


interface TurnSubmit {

    sealed class TurnSubmitActionError : Exception()
    class NotParticipantError : TurnSubmitActionError()


    /**
     * Submits the given commands of the given player for the given game
     * @throws TurnSubmitActionError
     */
    suspend fun perform(userId: String, gameId: String, commands: Collection<CommandData>)

}