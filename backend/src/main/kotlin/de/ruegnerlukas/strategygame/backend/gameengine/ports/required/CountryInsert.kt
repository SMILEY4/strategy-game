package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country

interface CountryInsert {
    suspend fun execute(country: Country, gameId: String): String
}