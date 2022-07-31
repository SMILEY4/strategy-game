package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerExtendedEntity

interface InsertPlayerExtended {
	suspend fun execute(extPlayer: PlayerExtendedEntity)
}