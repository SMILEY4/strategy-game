package de.ruegnerlukas.strategygame.backend.gameengine.external.api

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.app.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.common.logging.mdcGameId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.common.models.ErrorResponse
import de.ruegnerlukas.strategygame.backend.common.models.bodyErrorResponse
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewData
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityCreationPreviewRequest
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.PreviewCityCreation
import io.github.smiley4.ktorswaggerui.dsl.post
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object PreviewCity {

    private object GameNotFoundResponse : ErrorResponse(
        status = 404,
        title = "Game not found",
        errorCode = "GAME_NOT_FOUND",
        detail = "Game could not be found.",
    )

    private object CountryNotFoundResponse : ErrorResponse(
        status = 404,
        title = "Country not found",
        errorCode = "COUNTRY_NOT_FOUND",
        detail = "The associated country could not be found.",
    )

    fun Route.routePreviewCity(previewCity: PreviewCityCreation) = post("/{gameId}/preview/city", {
        description = "Provides a preview for creating a given city."
        request {
            pathParameter<String>("gameId") {
                description = "The id of the game"
            }
            body<CityCreationPreviewRequest>()
        }
        response {
            HttpStatusCode.OK to {
                body<CityCreationPreviewData>()
            }
            HttpStatusCode.NotFound to {
                bodyErrorResponse(GameNotFoundResponse, CountryNotFoundResponse)
            }
        }
    }) {
        val gameId = call.parameters["gameId"]!!
        val userId = call.getUserIdOrThrow()
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
            when (val result = previewCity.perform(gameId, userId, call.receive())) {
                is Either.Right -> call.respond(HttpStatusCode.OK, result.value)
                is Either.Left -> when (result.value) {
                    PreviewCityCreation.GameNotFoundError -> call.respond(GameNotFoundResponse)
                    PreviewCityCreation.CountryNotFoundError -> call.respond(CountryNotFoundResponse)
                }
            }
        }
    }

}