package io.github.smiley4.strategygame.backend.worlds.module.core.required

import io.github.smiley4.strategygame.backend.commondata.Game


interface GamesByUserQuery {
	suspend fun execute(userId: String): List<Game>
}