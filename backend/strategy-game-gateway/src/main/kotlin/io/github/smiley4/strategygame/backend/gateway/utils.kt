package io.github.smiley4.strategygame.backend.gateway

import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal

/**
 * Get the id of the user making an (authenticated) http-request
 * @return the user id
 * */
fun ApplicationCall.getUserIdOrThrow(): String {
    val principal = this.principal<JWTPrincipal>() ?: throw Exception("No JWT-Principal attached to call")
    return principal.payload.subject ?: throw Exception("No subject found in JWT-Principal")
}