package io.github.smiley4.strategygame.backend.worlds.module.core.provided


interface DisconnectFromGame {

	suspend fun perform(userId: String)

}