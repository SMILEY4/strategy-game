package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity

interface InsertMarker {
	suspend fun execute(marker: MarkerEntity)
}