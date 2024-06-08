package io.github.smiley4.strategygame.backend.engine.external.api

import io.github.smiley4.ktorswaggerui.dsl.get
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.common.models.ErrorResponse
import io.github.smiley4.strategygame.backend.common.utils.GZip.compressToBase64
import io.github.smiley4.strategygame.backend.common.utils.getUserIdOrThrow
import io.github.smiley4.strategygame.backend.engine.ports.provided.POVBuilder
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
            try {
                val states = povBuilder.build(userId, gameId)
                if (compression == "gzip") {
                    call.respond(HttpStatusCode.OK, compressToBase64(states.toPrettyJsonString()))
                } else {
                    call.respond(HttpStatusCode.OK, states.toPrettyJsonString())
                }
            } catch (e: POVBuilder.PlayerViewCreatorError) {
                when (e) {
                    is POVBuilder.GameNotFoundError -> call.respond(GameNotFoundResponse)
                }
            }
        }
    }

}