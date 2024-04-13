package de.ruegnerlukas.strategygame.backend.gameengine.external.api

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.app.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.common.logging.mdcGameId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.common.models.ErrorResponse
import de.ruegnerlukas.strategygame.backend.common.utils.GZip.compressToBase64
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.POVBuilder
import io.github.smiley4.ktorswaggerui.dsl.get
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

object RouteGameState {

    private object GameNotFoundResponse : ErrorResponse(
        status = 404,
        title = "Game not found",
        errorCode = "GAME_NOT_FOUND",
        detail = "Game could not be found.",
    )

    fun Route.routeGameState(povBuilder: POVBuilder) = get("/{gameId}/state", {
        description = "Provides the current state of the game from the pov of the user."
        request {
            pathParameter<String>("gameId") {
                description = "The id of the game"
                required = true
            }
            pathParameter<String>("compression") {
                description = "The compression to use. Only 'gzip' allowed"
                required = false
            }
        }
        response {
            HttpStatusCode.OK to {
                body {
                    mediaType(ContentType.Application.Json)
                }
            }
        }
    }) {
        val gameId = call.parameters["gameId"]!!
        val userId = call.getUserIdOrThrow()
        val compression = call.parameters["compression"]
        withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
            when (val result = povBuilder.build(userId, gameId)) {
                is Either.Right -> {
                    if (compression == "gzip") {
                        call.respond(HttpStatusCode.OK, compressToBase64(result.value.toPrettyJsonString()))
                    } else {
                        call.respond(HttpStatusCode.OK, result.value.toPrettyJsonString())
                    }
                }
                is Either.Left -> when (result.value) {
                    POVBuilder.GameNotFoundError -> call.respond(GameNotFoundResponse)
                }
            }
        }
    }

}