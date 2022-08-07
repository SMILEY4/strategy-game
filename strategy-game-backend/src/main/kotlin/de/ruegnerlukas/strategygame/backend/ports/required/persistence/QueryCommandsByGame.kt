package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity

interface QueryCommandsByGame {
	suspend fun execute(gameId: String, turn: Int): List<CommandEntity<*>>
}