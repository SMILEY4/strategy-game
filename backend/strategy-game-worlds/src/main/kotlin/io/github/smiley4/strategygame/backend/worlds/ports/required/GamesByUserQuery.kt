package io.github.smiley4.strategygame.backend.worlds.ports.required

import io.github.smiley4.strategygame.backend.common.models.Game


interface GamesByUserQuery {
	suspend fun execute(userId: String): List<Game>
}