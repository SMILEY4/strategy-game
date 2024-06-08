package io.github.smiley4.strategygame.backend.worlds.ports.required

import io.github.smiley4.strategygame.backend.common.models.Command


interface CommandsByGameQuery {
	suspend fun execute(gameId: String, turn: Int): List<Command<*>>
}