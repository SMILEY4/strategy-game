package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.provided.game.DisconnectAllPlayersAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UsersConnectedToGamesQuery

class DisconnectAllPlayersActionImpl(
    private val queryConnectedUsers: UsersConnectedToGamesQuery,
    private val disconnect: GameDisconnectAction
) : DisconnectAllPlayersAction {

    override suspend fun perform() {
        getUserIds().forEach { userId ->
            disconnect.perform(userId)
        }
    }

    private suspend fun getUserIds(): List<String> {
        return queryConnectedUsers.execute()
    }

}