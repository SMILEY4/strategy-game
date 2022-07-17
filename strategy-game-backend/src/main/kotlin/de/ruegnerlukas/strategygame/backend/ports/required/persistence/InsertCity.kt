package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity

interface InsertCity {
	suspend fun execute(city: CityEntity)
}