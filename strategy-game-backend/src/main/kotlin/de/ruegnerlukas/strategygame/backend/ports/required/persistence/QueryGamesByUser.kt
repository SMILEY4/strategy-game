package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity

interface QueryGamesByUser {
	suspend fun execute(userId: String): List<GameEntity>
}