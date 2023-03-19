package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.Command

interface CommandsByGameQuery {
	suspend fun execute(gameId: String, turn: Int): List<Command<*>>
}