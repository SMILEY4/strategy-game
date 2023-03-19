package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import de.ruegnerlukas.strategygame.backend.external.persistence.Collections

interface ReservationInsert {

	suspend fun execute(collection: String): String

	suspend fun reserveCity() = execute(Collections.CITIES)

	suspend fun reserveProvince() = execute(Collections.PROVINCES)

}