package de.ruegnerlukas.strategygame.backend.ports.required.persistence

interface UsersConnectedToGamesQuery {

    /**
     * @return the unique ids of users connected to one or multiple games (i.e. have an connection-id)
     */
    suspend fun execute(): List<String>
}