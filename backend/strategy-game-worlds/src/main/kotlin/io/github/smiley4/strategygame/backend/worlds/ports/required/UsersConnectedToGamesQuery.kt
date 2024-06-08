package io.github.smiley4.strategygame.backend.worlds.ports.required

interface UsersConnectedToGamesQuery {

    /**
     * @return the unique ids of users connected to one or multiple games (i.e. have an connection-id)
     */
    suspend fun execute(): List<String>
}