package io.github.smiley4.strategygame.backend.worlds.module.core.required

import io.github.smiley4.strategygame.backend.commondata.Command


interface CommandsByGameQuery {
	suspend fun execute(gameId: String, turn: Int): List<Command<*>>
}