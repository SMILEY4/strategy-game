package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.ktorswaggerui.dsl.get
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.gateway.getUserIdOrThrow
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

internal object RouteConfig {

    fun Route.routeConfig(gameConfig: GameConfig) = get("config", {
        description = "Fetch the configuration and values for games."
        response {
            HttpStatusCode.OK to {
                description = "Request for config was successful."
                body<GameConfig> {
                    description = "the configuration and values for all games."
                }
            }
        }
    }) {
        withLoggingContextAsync(mdcTraceId(), mdcUserId(call.getUserIdOrThrow())) {
            call.respond(HttpStatusCode.OK, gameConfig)
        }
    }

}
