package io.github.smiley4.strategygame.application.plugins

import io.github.smiley4.ktoropenapi.openApi
import io.github.smiley4.ktorswaggerui.swaggerUI
import io.github.smiley4.strategygame.identity.routingIdentity
import io.ktor.server.application.Application
import io.ktor.server.routing.route
import io.ktor.server.routing.routing

fun Application.setupRouting() {
    routing {
        route("api") {
            routingIdentity()
            routingOpenApi()
        }
    }
}