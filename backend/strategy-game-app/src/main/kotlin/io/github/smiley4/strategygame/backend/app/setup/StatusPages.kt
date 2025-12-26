package io.github.smiley4.strategygame.backend.app.setup

import io.github.smiley4.strategygame.backend.common.HttpErrorResponse
import io.github.smiley4.strategygame.backend.common.from
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.statuspages.StatusPages
import io.ktor.server.response.respond
import mu.two.KotlinLogging

/**
 * Configure status pages.
 */
fun Application.setupStatusPages() {
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            KotlinLogging.logger { }.error("Controller received error", cause)
            HttpErrorResponse.from(cause).also { response ->
                call.respond(HttpStatusCode.fromValue(response.status), response)
            }
        }
    }
}