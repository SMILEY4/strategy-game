package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameUpdate
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameDisconnectActionImpl(
    private val gamesByUserQuery: GamesByUserQuery,
    private val gameUpdate: GameUpdate
) : GameDisconnectAction, Logging {

    override suspend fun perform(userId: String) {
        log().info("Disconnect user $userId from all currently connected games")
        val games = findGames(userId)
        clearConnections(userId, games)
    }

    /**
     * find all games of the current user
     */
    private suspend fun findGames(userId: String): List<Game> {
        return gamesByUserQuery.execute(userId)
    }

    /**
     * Set all connections of the given user to "null"
     */
    private suspend fun clearConnections(userId: String, games: List<Game>) {
        gamesWithConnectedUser(games, userId).forEach { game ->
            game.players.findByUserId(userId)?.connectionId = null
            gameUpdate.execute(game)
        }
    }

    /**
     * Find all games the player with the given userId is currently connected to
     */
    private fun gamesWithConnectedUser(games: List<Game>, userId: String): List<Game> {
        return games.filter { game -> game.players.findByUserId(userId)?.connectionId != null }
    }

}