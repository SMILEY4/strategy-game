package io.github.smiley4.strategygame.backend.gateway.operation

import io.github.smiley4.ktorswaggerui.dsl.routing.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.micrometer.prometheusmetrics.PrometheusMeterRegistry

fun Route.routeMetrics(meterRegistry: PrometheusMeterRegistry) = get("metrics", {
    description = "Provides various metrics about the (current) state of the application."
    response {
        HttpStatusCode.OK to {
            body<String>()
        }
    }
}) {
    val metrics = meterRegistry.scrape()
    call.respondText { metrics }
}