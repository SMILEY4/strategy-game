package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity

interface GamesByUserQuery {
	suspend fun execute(userId: String): List<GameEntity>
}