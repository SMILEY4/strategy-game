package de.ruegnerlukas.strategygame.backend.external.api.routing.game

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.external.api.routing.getUserIdOrThrow
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.mdcUserId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
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