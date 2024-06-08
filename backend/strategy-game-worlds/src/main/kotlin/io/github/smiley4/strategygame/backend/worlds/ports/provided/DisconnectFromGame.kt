package io.github.smiley4.strategygame.backend.worlds.ports.provided


interface DisconnectFromGame {

	suspend fun perform(userId: String)

}