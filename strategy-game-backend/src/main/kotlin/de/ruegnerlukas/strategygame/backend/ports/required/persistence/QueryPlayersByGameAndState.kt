package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.OldPlayerEntity

interface QueryPlayersByGameAndState {
	suspend fun execute(gameId: String, state: String): List<OldPlayerEntity>
}