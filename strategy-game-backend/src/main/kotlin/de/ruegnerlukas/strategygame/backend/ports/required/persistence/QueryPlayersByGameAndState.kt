package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface QueryPlayersByGameAndState {
	suspend fun execute(gameId: String, state: String): List<PlayerEntity>
}