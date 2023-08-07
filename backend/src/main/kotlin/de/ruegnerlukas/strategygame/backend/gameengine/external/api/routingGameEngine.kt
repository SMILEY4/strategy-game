package de.ruegnerlukas.strategygame.backend.gameengine.external.api

import de.ruegnerlukas.strategygame.backend.gameengine.external.api.PreviewCity.routePreviewCity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

fun Route.routingGameEngine() {
    val previewCity by inject<PreviewCityCreation>()
    route("game") {
        authenticate("user") {
            routePreviewCity(previewCity)
        }
    }
}