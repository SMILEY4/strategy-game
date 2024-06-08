package io.github.smiley4.strategygame.backend.worlds.ports.required

import io.github.smiley4.strategygame.backend.common.models.Game


interface GameInsert {
	suspend fun execute(game: Game): String
}