package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameCreateEntity

interface InsertGame {
	suspend fun execute(game: GameCreateEntity)
}