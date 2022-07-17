package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface QueryPlayersByGame {
	suspend fun execute(gameId: String): List<PlayerEntity>
}