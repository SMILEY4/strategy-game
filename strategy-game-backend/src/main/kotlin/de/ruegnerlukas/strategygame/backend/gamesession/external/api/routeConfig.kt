package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.app.ApiResponse
import de.ruegnerlukas.strategygame.backend.app.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.ktorswaggerui.dsl.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.routing.Route

fun Route.routeConfig(gameConfig: GameConfig) = get("config", {
    description = "Fetch the configuration and values for games."
    response {
        HttpStatusCode.OK to {
            description = "Request for config was successful."
            body(GameConfig::class) {
                description = "the configuration and values for all games."
            }
        }
    }
}) {
    withLoggingContextAsync(mdcTraceId(), mdcUserId(call.getUserIdOrThrow())) {
        ApiResponse.respondSuccess(call, gameConfig)
    }
}