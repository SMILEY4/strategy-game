package io.github.smiley4.strategygame.backend.engine.ports.required

import io.github.smiley4.strategygame.backend.common.persistence.Collections


interface ReservationInsert {

	suspend fun execute(collection: String): String

	suspend fun reserveCity() = execute(Collections.CITIES)

	suspend fun reserveProvince() = execute(Collections.PROVINCES)

	suspend fun reserveRoute() = execute(Collections.ROUTES)

}