package de.ruegnerlukas.strategygame.backend.common.api

import de.ruegnerlukas.strategygame.backend.gamesession.external.api.routingGame
import de.ruegnerlukas.strategygame.backend.operation.external.routeStaticResources
import de.ruegnerlukas.strategygame.backend.operation.external.routingInternal
import de.ruegnerlukas.strategygame.backend.user.external.api.routingUser
import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.routing.Route
import io.ktor.server.routing.route

fun Route.routingApi() {
    route("api") {
        routingUser()
        routingGame()
        routingInternal()
    }
    routeStaticResources()
}


/**
 * Get the id of the user making an (authenticated) http-request
 * @return the user id
 * */
fun ApplicationCall.getUserIdOrThrow(): String {
    val principal = this.principal<JWTPrincipal>() ?: throw Exception("No JWT-Principal attached to call")
    return principal.payload.subject ?: throw Exception("No subject found in JWT-Principal")
}
