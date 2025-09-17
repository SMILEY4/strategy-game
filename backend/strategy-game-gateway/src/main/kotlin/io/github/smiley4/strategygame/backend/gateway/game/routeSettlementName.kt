package io.github.smiley4.strategygame.backend.gateway.game

import io.github.smiley4.ktorswaggerui.dsl.routing.get
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.gateway.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.bodyErrorResponse
import io.github.smiley4.strategygame.backend.gateway.getUserIdOrThrow
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteSettlementName {

    private object UnauthorizedResponse : ErrorResponse(
        status = 401,
        title = "Unauthorized",
        errorCode = "UNAUTHORIZED",
        detail = "The provided email or password is invalid.",
    )

    fun Route.routeSettlementName() = get("randomname", {
        description = "Get a randomly generated name for a new settlement"
        request { }
        response {
            HttpStatusCode.OK to {
                body<RandomNameResponse>()
            }
            HttpStatusCode.Unauthorized to {
                bodyErrorResponse(UnauthorizedResponse)
            }
        }
    }) {
        call.respond(HttpStatusCode.NotImplemented)
    }

    data class RandomNameResponse(
        val name: String
    )

}

