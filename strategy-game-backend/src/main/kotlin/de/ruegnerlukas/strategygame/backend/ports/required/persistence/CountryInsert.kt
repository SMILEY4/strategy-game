package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity

interface CountryInsert {
	suspend fun execute(country: CountryEntity)
}