package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import de.ruegnerlukas.strategygame.backend.common.persistence.Collections

interface ReservationInsert {

	suspend fun execute(collection: String): String

	suspend fun reserveCity() = execute(Collections.CITIES)

	suspend fun reserveProvince() = execute(Collections.PROVINCES)

	suspend fun reserveRoute() = execute(Collections.ROUTES)

}