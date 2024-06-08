package io.github.smiley4.strategygame.backend.engine.ports.required

import io.github.smiley4.strategygame.backend.engine.ports.models.Country


interface CountryInsert {
    suspend fun execute(country: Country, gameId: String): String
}