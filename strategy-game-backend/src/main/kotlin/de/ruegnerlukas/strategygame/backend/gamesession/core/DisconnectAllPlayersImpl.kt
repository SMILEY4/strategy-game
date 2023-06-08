package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayers
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectFromGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.UsersConnectedToGamesQuery

class DisconnectAllPlayersImpl(
    private val queryConnectedUsers: UsersConnectedToGamesQuery,
    private val disconnect: DisconnectFromGame
) : DisconnectAllPlayers {

    override suspend fun perform() {
        getUserIds().forEach { userId ->
            disconnect.perform(userId)
        }
    }

    private suspend fun getUserIds(): List<String> {
        return queryConnectedUsers.execute()
    }

}