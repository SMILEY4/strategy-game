package io.github.smiley4.strategygame.backend.app.operation

import io.github.smiley4.ktorswaggerui.dsl.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route

fun Route.routeHealth() = get("health", {
    description = "Responds with '200 OK' together with the current system timestamp to indicate a 'healthy' application."
    response {
        HttpStatusCode.OK to {
            description = "Indicates a 'healthy' application."
            body<String> {
                example("Response", "Healthy 1678225417")
            }
        }
    }
}) {
    call.respond(HttpStatusCode.OK, "Healthy ${System.currentTimeMillis()}")
}