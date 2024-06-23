package io.github.smiley4.strategygame.backend.worlds.edge


interface DisconnectFromGame {

	suspend fun perform(userId: String)

}