package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.external.api.message.websocket.WebsocketUtils
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import io.micrometer.prometheus.PrometheusMeterRegistry
import org.koin.ktor.ext.inject


/**
 * Main configuration for all routes
 */
fun Application.apiRoutes() {
    val meterRegistry by inject<PrometheusMeterRegistry>()
    routing {
        route("api") {
            userRoutes()
            gameRoutes()
            gameWebsocketRoutes()
            get("/health") {
                call.respond(HttpStatusCode.OK, "Healthy ${System.currentTimeMillis()}")
            }
            get("/metrics") {
                val metrics = meterRegistry.scrape()
                call.respondText { metrics }
            }
        }
    }
}

/**
 * Get the id of the user making an (authenticated) http-request
 * @param call the request
 * @return the user id
 * */
fun getUserIdOrThrow(call: ApplicationCall): String {
    val principal = call.principal<JWTPrincipal>() ?: throw Exception("No JWT-Principal attached to call")
    return principal.payload.subject ?: throw Exception("No subject found in JWT-Principal")
}

/**
 * Get the id of the user opening an (authenticated) websocket-connection
 * @param call the request
 * @return the user id
 * */
fun getWebsocketUserIdOrThrow(userService: UserIdentityService, call: ApplicationCall): String {
    return userService.extractUserId(call.request.queryParameters[WebsocketUtils.QUERY_PARAM_TOKEN]!!)
}
