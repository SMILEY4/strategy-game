package de.ruegnerlukas.strategygame.backend.gameengine.external.api

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.app.ApiResponse
import de.ruegnerlukas.strategygame.backend.app.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.common.logging.mdcGameId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewRequest
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation
import io.github.smiley4.ktorswaggerui.dsl.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.routing.Route

fun Route.routePreviewCity(previewCity: PreviewCityCreation) = get("/{gameId}/preview/city", {
    description = "Provides a preview for creating a given city."
    request {
        pathParameter<String>("gameId") {
            description = "The id of the game"
        }
        body<CityCreationPreviewRequest>()
    }
    response {
        HttpStatusCode.OK to {
            description = "Preview was successfully created."
            body<CityCreationPreviewData>()
        }
    }
}) {
    val gameId = call.parameters["gameId"]!!
    val userId = call.getUserIdOrThrow()
    withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
        when (val result = previewCity.perform(gameId, userId, call.receive())) {
            is Either.Right -> ApiResponse.respondSuccess(call, result.value)
            is Either.Left -> when (result.value) {
                PreviewCityCreation.GameNotFoundError -> ApiResponse.respondFailure(call, result.value)
                PreviewCityCreation.CountryNotFoundError -> ApiResponse.respondFailure(call, result.value)
            }
        }
    }
}