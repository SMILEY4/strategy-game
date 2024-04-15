package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.CommandData

interface TurnSubmit {

    sealed class TurnSubmitActionError : Exception()
    class NotParticipantError : TurnSubmitActionError()


    /**
     * Submits the given commands of the given player for the given game
     * @throws TurnSubmitActionError
     */
    suspend fun perform(userId: String, gameId: String, commands: Collection<CommandData>)

}